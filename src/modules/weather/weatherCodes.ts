import { Cloud, CloudFog, CloudLightning, CloudRain, CloudSnow, Sun, type LucideIcon } from "lucide-react-native";

/** Buckets the WMO weather codes Open-Meteo returns into a label + icon. */
export function describeWeatherCode(code: number): { label: string; icon: LucideIcon } {
  if (code === 0) return { label: "Clear", icon: Sun };
  if (code <= 3) return { label: "Partly cloudy", icon: Cloud };
  if (code === 45 || code === 48) return { label: "Fog", icon: CloudFog };
  if (code >= 51 && code <= 67) return { label: "Rain", icon: CloudRain };
  if (code >= 71 && code <= 77) return { label: "Snow", icon: CloudSnow };
  if (code >= 80 && code <= 82) return { label: "Showers", icon: CloudRain };
  if (code >= 85 && code <= 86) return { label: "Snow showers", icon: CloudSnow };
  if (code >= 95) return { label: "Thunderstorm", icon: CloudLightning };
  return { label: "Cloudy", icon: Cloud };
}
