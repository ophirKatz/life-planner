// Scheduled by pg_cron (see migration 0009) — no user JWT, runs as the
// service role. Pulls incremental changes for every active Google account
// (DESIGN.md §6.4) and upserts calendar_events; also runs the attendee ->
// person auto-link server automation (DESIGN.md §8 item 1).
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { decryptToken, encryptToken } from "../_shared/crypto.ts";
import { listCalendarEvents, refreshAccessToken, type GoogleCalendarEvent } from "../_shared/google.ts";
import { createAdminClient } from "../_shared/supabaseAdmin.ts";

function mapEventToRow(event: GoogleCalendarEvent, userId: string, accountId: string) {
  const isAllDay = !!event.start?.date;
  const startsAt = event.start?.dateTime ?? `${event.start?.date}T00:00:00.000Z`;
  const endsAt = event.end?.dateTime ?? `${event.end?.date}T00:00:00.000Z`;

  return {
    user_id: userId,
    account_id: accountId,
    source: "google_calendar",
    external_id: event.id,
    external_etag: event.etag,
    title: event.summary ?? "(No title)",
    description: event.description ?? null,
    location: event.location ?? null,
    all_day: isAllDay,
    starts_at: startsAt,
    ends_at: endsAt,
    rrule: event.recurrence?.[0]?.replace(/^RRULE:/, "") ?? null,
    color: "#6366f1",
  };
}

async function linkAttendees(
  admin: ReturnType<typeof createAdminClient>,
  userId: string,
  calendarEventId: string,
  attendeeEmails: string[]
) {
  if (attendeeEmails.length === 0) return;

  const { data: people } = await admin
    .from("people")
    .select("id, emails")
    .eq("user_id", userId)
    .overlaps("emails", attendeeEmails);

  for (const person of people ?? []) {
    await admin
      .from("links")
      .upsert(
        {
          user_id: userId,
          from_type: "person",
          from_id: person.id,
          to_type: "calendar_event",
          to_id: calendarEventId,
          rel_type: "attendee",
        },
        { onConflict: "user_id,from_type,from_id,to_type,to_id,rel_type", ignoreDuplicates: true }
      );
  }
}

async function syncAccount(admin: ReturnType<typeof createAdminClient>, account: {
  id: string;
  user_id: string;
  refresh_token_enc: string;
  token_expires_at: string | null;
  sync_token: string | null;
}) {
  const refreshToken = await decryptToken(account.refresh_token_enc);
  const tokens = await refreshAccessToken(refreshToken);
  await admin
    .from("connected_accounts")
    .update({
      access_token_enc: await encryptToken(tokens.accessToken),
      token_expires_at: new Date(Date.now() + tokens.expiresIn * 1000).toISOString(),
    })
    .eq("id", account.id);

  let syncToken = account.sync_token ?? undefined;
  let pageToken: string | undefined;
  let nextSyncToken: string | undefined;
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();

  do {
    const page = await listCalendarEvents(tokens.accessToken, {
      syncToken,
      pageToken,
      timeMin: syncToken ? undefined : sixtyDaysAgo,
    });

    if ("expiredSyncToken" in page) {
      // 410 Gone: the stored cursor is invalid — drop it and do a fresh pull.
      syncToken = undefined;
      pageToken = undefined;
      continue;
    }

    for (const event of page.events) {
      if (event.status === "cancelled") {
        await admin
          .from("calendar_events")
          .delete()
          .eq("account_id", account.id)
          .eq("external_id", event.id);
        continue;
      }

      const { data: saved } = await admin
        .from("calendar_events")
        .upsert(mapEventToRow(event, account.user_id, account.id), { onConflict: "account_id,external_id" })
        .select("id")
        .single();

      const attendeeEmails = (event.attendees ?? []).map((a) => a.email).filter(Boolean);
      if (saved) await linkAttendees(admin, account.user_id, saved.id, attendeeEmails);
    }

    pageToken = page.nextPageToken;
    nextSyncToken = page.nextSyncToken ?? nextSyncToken;
  } while (pageToken);

  await admin
    .from("connected_accounts")
    .update({ sync_token: nextSyncToken ?? null, last_synced_at: new Date().toISOString() })
    .eq("id", account.id);
}

Deno.serve(async (req) => {
  const preflight = handleCors(req);
  if (preflight) return preflight;

  const admin = createAdminClient();
  const { data: accounts, error } = await admin
    .from("connected_accounts")
    .select("id, user_id, refresh_token_enc, token_expires_at, sync_token")
    .eq("provider", "google")
    .eq("status", "active");

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results = await Promise.allSettled((accounts ?? []).map((a) => syncAccount(admin, a)));
  const failures = results.filter((r) => r.status === "rejected");

  return new Response(
    JSON.stringify({ synced: (accounts ?? []).length, failures: failures.length }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
