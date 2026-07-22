// Geocodes a free-text place name into candidates the client can pick from,
// via Open-Meteo's geocoding API (free, no API key). Auth-gated like every
// other Edge Function even though it doesn't touch user data, for
// consistency and to keep it off an open/unauthenticated proxy.
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/supabaseAdmin.ts";

interface GeocodeResult {
  name: string;
  admin1?: string;
  country?: string;
  latitude: number;
  longitude: number;
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

    const { query } = await req.json();
    if (!query || typeof query !== "string" || query.trim().length < 2) {
      throw new Error("query must be at least 2 characters.");
    }

    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=5&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Geocoding API error ${res.status}`);

    const data: { results?: GeocodeResult[] } = await res.json();
    const results = (data.results ?? []).map((r) => ({
      label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
      lat: r.latitude,
      lng: r.longitude,
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
