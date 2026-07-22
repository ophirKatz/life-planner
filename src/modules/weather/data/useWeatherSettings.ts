import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { LocationCandidate, WeatherSettingsRow } from "@/modules/weather/types";

export const weatherSettingsKey = ["weather-settings"] as const;

export function useWeatherSettings() {
  return useQuery({
    queryKey: weatherSettingsKey,
    queryFn: async (): Promise<WeatherSettingsRow | null> => {
      const { data, error } = await supabase.from("weather_settings").select("*").maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

export function useSetWeatherLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (location: LocationCandidate): Promise<WeatherSettingsRow> => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");
      const { data, error } = await supabase
        .from("weather_settings")
        .upsert(
          { user_id: auth.user.id, location_lat: location.lat, location_lng: location.lng, location_label: location.label },
          { onConflict: "user_id" }
        )
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: weatherSettingsKey }),
  });
}

async function extractFunctionErrorMessage(error: unknown): Promise<string> {
  if (error && typeof error === "object" && "context" in error) {
    try {
      const context = (error as { context: Response }).context;
      const body = await context.json();
      if (typeof body?.error === "string") return body.error;
    } catch {
      // fall through to the generic message below
    }
  }
  return error instanceof Error ? error.message : "Search failed.";
}

export function useSearchWeatherLocation() {
  return useMutation({
    mutationFn: async (query: string): Promise<LocationCandidate[]> => {
      const { data, error } = await supabase.functions.invoke("search-weather-location", { body: { query } });
      if (error) throw new Error(await extractFunctionErrorMessage(error));
      return data.results as LocationCandidate[];
    },
  });
}
