import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { WeatherReport } from "@/modules/weather/types";

export const currentWeatherKey = ["weather", "current"] as const;

/** Live forecast for the caller's saved location — never cached server-side,
 * so a 15-minute client staleTime is the only caching layer. */
export function useCurrentWeather(hasLocation: boolean) {
  return useQuery({
    queryKey: currentWeatherKey,
    queryFn: async (): Promise<WeatherReport> => {
      const { data, error } = await supabase.functions.invoke("fetch-weather");
      if (error) throw error;
      return data as WeatherReport;
    },
    enabled: hasLocation,
    staleTime: 15 * 60 * 1000,
  });
}
