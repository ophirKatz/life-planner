import { router } from "expo-router";
import { Mountain } from "lucide-react-native";

import { ClimbingWidget } from "@/modules/climbing/components/ClimbingWidget";
import type { ModuleDefinition } from "@/core/modules/types";

export const climbingModule: ModuleDefinition = {
  slug: "climbing",
  name: "Climbing",
  icon: Mountain,
  tier: "pro",
  routes: [{ path: "climbing", title: "Climbing" }],
  dashboardWidgets: [ClimbingWidget],
  quickAddActions: [
    {
      id: "climbing.new",
      label: "Log a session",
      icon: Mountain,
      onPress: () => router.push("/modules/climbing/new"),
    },
  ],
  linkableEntities: [],
};
