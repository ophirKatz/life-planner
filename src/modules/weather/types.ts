import type { Tables } from "@/core/db/types";

export type WeatherSettingsRow = Tables<"weather_settings">;

export interface WeatherReport {
  location: string;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  high: number;
  low: number;
}

export interface LocationCandidate {
  label: string;
  lat: number;
  lng: number;
}
