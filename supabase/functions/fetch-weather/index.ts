// Live current-conditions + today's forecast for the caller's saved
// location (weather_settings), proxied through Open-Meteo (free, no API
// key). Never cached server-side — the client's react-query staleTime is
// the only caching layer, matching how short-lived this data is.
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { createUserClient } from "../_shared/supabaseAdmin.ts";

interface OpenMeteoResponse {
  current: { temperature_2m: number; weather_code: number; wind_speed_10m: number };
  daily: { temperature_2m_max: number[]; temperature_2m_min: number[]; weather_code: number[] };
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

    const { data: settings, error: settingsError } = await userClient
      .from("weather_settings")
      .select("location_lat, location_lng, location_label")
      .eq("user_id", user.id)
      .maybeSingle();
    if (settingsError) throw settingsError;
    if (!settings) {
      return new Response(JSON.stringify({ error: "NO_LOCATION" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url =
      `https://api.open-meteo.com/v1/forecast?latitude=${settings.location_lat}&longitude=${settings.location_lng}` +
      `&current=temperature_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code` +
      `&temperature_unit=celsius&timezone=auto&forecast_days=1`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Weather API error ${res.status}`);

    const data: OpenMeteoResponse = await res.json();

    return new Response(
      JSON.stringify({
        location: settings.location_label,
        temperature: Math.round(data.current.temperature_2m),
        weatherCode: data.current.weather_code,
        windSpeed: Math.round(data.current.wind_speed_10m),
        high: Math.round(data.daily.temperature_2m_max[0]),
        low: Math.round(data.daily.temperature_2m_min[0]),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
