// AI daily/weekly digest for the Focus module (pro-tier — the module's only
// value is this curation, so it's gated at the module level rather than a
// feature inside a free module; see summarize-person-interactions for that
// other pattern). Groups tasks and calendar events into short thematic
// cards. Ported from personal-dashboard's generate-focus-summary, adapted to
// this app's schema (tasks.due_at/status vs. todos.due_date+due_time+
// completed) and simplified to on-demand generation only — no pg_cron
// auto-refresh in v1.
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createAdminClient, createUserClient } from "../_shared/supabaseAdmin.ts";

type Period = "tomorrow" | "week";

type Task = { id: string; title: string; notes: string | null; due_at: string | null; priority: number };
type Event = { id: string; title: string; starts_at: string; ends_at: string; location: string | null; all_day: boolean };

type FocusCardItem = { type: "task" | "event"; id: string; title: string };
type FocusCard = { label: string; insight: string; items: FocusCardItem[] };
type SummaryPayload = { type: "cards"; cards: FocusCard[]; note: string | null } | { type: "text"; text: string };

function dayRange(daysFromNow: number): { start: string; end: string } {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + daysFromNow);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

async function callClaude(
  period: Period,
  context: { tasks: Task[]; events: Event[] },
  apiKey: string
): Promise<string> {
  const system =
    `You are a focus assistant inside a personal planner app. Given a user's tasks and calendar ` +
    `events for ${period === "tomorrow" ? "tomorrow" : "the next 7 days"}, group related items into short, ` +
    `thematic cards — e.g. a meeting with its prep task, items tied to the same project, or a cluster of ` +
    `back-to-back commitments. Items with nothing else to group with still get their own single-item ` +
    `card; never omit an item. Respond with ONLY a JSON object (no markdown fences, no commentary) ` +
    `matching this shape:\n` +
    `{"cards": [{"label": string, "insight": string, "items": [{"type": "task" | "event", "id": string}]}], "note": string | null}\n` +
    `- "label": a short 2-5 word title for the group.\n` +
    `- "insight": one short sentence about the group — urgency, timing, or conflicts.\n` +
    `- "items": reference ONLY "id" values present in the input data, tagged with their "type". Never invent ids.\n` +
    `- Order cards with the most urgent/important first.\n` +
    `- "note": one short overall remark (e.g. a cross-card conflict, or how light/heavy the period looks), or null.`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: period === "tomorrow" ? 1024 : 4096,
      system,
      messages: [{ role: "user", content: JSON.stringify(context) }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic API error ${res.status}: ${await res.text()}`);
  const data: { content?: Array<{ text?: string }> } = await res.json();
  return data.content?.[0]?.text?.trim() ?? "";
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return (fenced ? fenced[1] : text).trim();
}

// Resolves the model's id references back against the actual tasks/events so
// the stored payload is self-contained. Cards left with no valid items
// (hallucinated ids) are dropped; if that leaves nothing, fall back to raw text.
function resolveCards(raw: string, tasks: Task[], events: Event[]): SummaryPayload {
  const parsed = JSON.parse(extractJson(raw)) as {
    cards?: Array<{ label?: string; insight?: string; items?: Array<{ type?: string; id?: string }> }>;
    note?: string | null;
  };

  const tasksById = new Map(tasks.map((t) => [t.id, t]));
  const eventsById = new Map(events.map((e) => [e.id, e]));

  const cards: FocusCard[] = (parsed.cards ?? [])
    .map((card) => {
      const items: FocusCardItem[] = (card.items ?? [])
        .map((item): FocusCardItem | null => {
          if (item.type === "task" && item.id) {
            const task = tasksById.get(item.id);
            return task ? { type: "task", id: task.id, title: task.title } : null;
          }
          if (item.type === "event" && item.id) {
            const event = eventsById.get(item.id);
            return event ? { type: "event", id: event.id, title: event.title } : null;
          }
          return null;
        })
        .filter((item): item is FocusCardItem => item !== null);
      return { label: card.label?.trim() || "Untitled", insight: card.insight?.trim() ?? "", items };
    })
    .filter((card) => card.items.length > 0);

  if (cards.length === 0) throw new Error("No matched items in model response");
  return { type: "cards", cards, note: parsed.note?.trim() || null };
}

async function upsertSummary(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  period: Period,
  patch: { summary?: SummaryPayload; status: "ready" | "error"; error?: string }
) {
  const payload: Record<string, unknown> = {
    user_id: userId,
    period,
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
  await admin.from("focus_summaries").upsert(payload, { onConflict: "user_id,period" });
}

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

    const body: { period?: Period } = await req.json().catch(() => ({}));
    const period: Period = body.period === "week" ? "week" : "tomorrow";

    const admin = createAdminClient();

    const { data: subscription } = await admin
      .from("subscriptions")
      .select("is_pro")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!subscription?.is_pro) {
      return new Response(JSON.stringify({ error: "PAYWALL: Focus requires an active subscription" }), {
        status: 402,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const rangeStart = period === "tomorrow" ? dayRange(1).start : dayRange(0).start;
    const rangeEnd = period === "tomorrow" ? dayRange(1).end : dayRange(7).start;

    let tasksQuery = admin
      .from("tasks")
      .select("id, title, notes, due_at, priority")
      .eq("user_id", user.id)
      .neq("status", "done");
    tasksQuery =
      period === "tomorrow"
        ? tasksQuery.or(`due_at.gte.${rangeStart},due_at.is.null`).lt("due_at", rangeEnd)
        : tasksQuery.gte("due_at", rangeStart).lt("due_at", rangeEnd);

    const [tasksRes, eventsRes] = await Promise.all([
      tasksQuery,
      admin
        .from("calendar_events")
        .select("id, title, starts_at, ends_at, location, all_day")
        .eq("user_id", user.id)
        .lt("starts_at", rangeEnd)
        .gt("ends_at", rangeStart),
    ]);

    const tasks = (tasksRes.data ?? []) as Task[];
    const events = (eventsRes.data ?? []) as Event[];

    let payload: SummaryPayload;
    if (tasks.length === 0 && events.length === 0) {
      const note =
        period === "tomorrow"
          ? "Nothing on the books for tomorrow — a clear day. Good time to get ahead on something, or just rest."
          : "Nothing scheduled for the week ahead yet. A clean slate.";
      payload = { type: "cards", cards: [], note };
    } else {
      const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY");
      if (!anthropicApiKey) throw new Error("ANTHROPIC_API_KEY is not configured.");
      const raw = await callClaude(period, { tasks, events }, anthropicApiKey);
      try {
        payload = resolveCards(raw, tasks, events);
      } catch {
        payload = { type: "text", text: raw };
      }
    }

    await upsertSummary(admin, user.id, period, { summary: payload, status: "ready" });

    return new Response(JSON.stringify({ period, summary: payload }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
