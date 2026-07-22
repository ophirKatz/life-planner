import { CloudSun } from "lucide-react-native";

import { WeatherWidget } from "@/modules/weather/components/WeatherWidget";
import type { ModuleDefinition } from "@/core/modules/types";

export const weatherModule: ModuleDefinition = {
  slug: "weather",
  name: "Weather",
  icon: CloudSun,
  tier: "pro",
  routes: [{ path: "weather", title: "Weather" }],
  dashboardWidgets: [WeatherWidget],
  quickAddActions: [],
  linkableEntities: [],
};
