// AI relationship summary for a person (People module pro feature,
// DESIGN.md §7.3). Reads logged interactions and asks Claude for a short
// recap. Gated on subscriptions.is_pro — checked here, not via a DB trigger,
// since this isn't a row insert the platform's enforce_module_limits pattern
// covers; it's a generate-on-demand action.
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient, createUserClient } from "../_shared/supabaseAdmin.ts";

type Period = "month" | "year" | "all";

Deno.serve(async (req: Request) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header.");

    const userClient = createUserClient(authHeader);
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser();
    if (userError || !user) throw new Error("Not authenticated.");

    const body: { person_id?: string; period?: Period; forceRefresh?: boolean } = await req
      .json()
      .catch(() => ({}));
    const { person_id: personId, period = "month", forceRefresh = false } = body;
    if (!personId) throw new Error("person_id is required.");

    const admin = createAdminClient();

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("is_pro")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!subscription?.is_pro) {
      return new Response(
        JSON.stringify({ error: "PAYWALL: AI summaries require an active subscription" }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: flag } = await admin
      .from("feature_flags")
      .select("enabled")
      .eq("key", "ai_people_summary")
      .maybeSingle();
    if (flag && !flag.enabled) {
      return new Response(
        JSON.stringify({ error: "FEATURE_DISABLED: AI summaries are temporarily unavailable" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!forceRefresh) {
      const { data: cached } = await admin
        .from("person_summaries")
        .select("summary, status, generated_at")
        .eq("user_id", user.id)
        .eq("person_id", personId)
        .maybeSingle();

      if (cached?.status === "ready" && cached.summary && cached.generated_at) {
        const hoursSinceGenerated = (Date.now() - new Date(cached.generated_at).getTime()) / 3_600_000;
        if (hoursSinceGenerated < 24) {
          return new Response(JSON.stringify({ summary: cached.summary, fromCache: true }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    const { data: person, error: personError } = await admin
      .from("people")
      .select("display_name, notes")
      .eq("id", personId)
      .eq("user_id", user.id)
      .single();
    if (personError || !person) throw new Error("Person not found.");

    let interactionsQuery = admin
      .from("people_interactions")
      .select("interaction_date, note")
      .eq("person_id", personId)
      .eq("user_id", user.id)
      .order("interaction_date", { ascending: false });

    const now = new Date();
    if (period === "month") {
      const start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      interactionsQuery = interactionsQuery.gte("interaction_date", start);
    } else if (period === "year") {
      interactionsQuery = interactionsQuery.gte("interaction_date", `${now.getFullYear()}-01-01`);
    }

    const { data: interactions, error: interactionsError } = await interactionsQuery;
    if (interactionsError) throw interactionsError;

    if (!interactions || interactions.length === 0) {
      return new Response(
        JSON.stringify({ summary: "No interactions logged for this period.", fromCache: false }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicApiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");

    const interactionLines = interactions
      .map((i) => `- ${i.interaction_date}${i.note ? `: ${i.note}` : ""}`)
      .join("\n");

    const contextParts = [`Person: ${person.display_name}`];
    if (person.notes) contextParts.push(`Notes about them: ${person.notes}`);
    contextParts.push(`\nInteractions (${period}):\n${interactionLines}`);

    const system =
      "You are a personal assistant helping a user reflect on their relationships. " +
      "You will receive context about a person and a list of logged interactions (dates and " +
      "optional notes). Write a brief 2-4 sentence summary of the relationship activity in the " +
      "period. Use the context to make the summary personal and specific, not generic. Focus on " +
      "patterns and topics discussed. Do not use bullet points.";

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": anthropicApiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system,
        messages: [{ role: "user", content: contextParts.join("\n") }],
      }),
    });

    if (!aiRes.ok) {
      const errBody = await aiRes.text().catch(() => "");
      await upsertSummary(admin, user.id, personId, { status: "error", error: `Anthropic API ${aiRes.status}` });
      throw new Error(`Anthropic API ${aiRes.status}: ${errBody.slice(0, 200)}`);
    }

    const data: { content?: Array<{ text?: string }> } = await aiRes.json();
    const summary = data.content?.[0]?.text?.trim() || "No summary available for this period.";

    await upsertSummary(admin, user.id, personId, { summary, status: "ready" });

    return new Response(JSON.stringify({ summary, fromCache: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function upsertSummary(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  personId: string,
  patch: { summary?: string; status: "ready" | "error"; error?: string }
) {
  const payload: Record<string, unknown> = {
    user_id: userId,
    person_id: personId,
    status: patch.status,
    updated_at: new Date().toISOString(),
  };
  if (patch.status === "ready") {
    payload.summary = patch.summary;
    payload.error = null;
    payload.generated_at = new Date().toISOString();
  } else {
    payload.error = patch.error ?? "Unknown error";
  }
  await admin.from("person_summaries").upsert(payload, { onConflict: "user_id,person_id" });
}
