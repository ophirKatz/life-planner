import { createClient } from "npm:@supabase/supabase-js@2";

/** Service-role client — bypasses RLS. Never expose this client or its key
 * to the app; it only ever runs inside Edge Functions. */
export function createAdminClient() {
  const url = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceRoleKey) {
    throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are not set.");
  }
  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}

/** Anon-key client that forwards the caller's JWT, for auth.getUser() checks. */
export function createUserClient(authHeader: string) {
  const url = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !anonKey) throw new Error("SUPABASE_URL / SUPABASE_ANON_KEY are not set.");
  return createClient(url, anonKey, {
    auth: { persistSession: false },
    global: { headers: { Authorization: authHeader } },
  });
}
