import { router } from "expo-router";
import { Dumbbell } from "lucide-react-native";

import { WorkoutsWidget } from "@/modules/workouts/components/WorkoutsWidget";
import type { ModuleDefinition } from "@/core/modules/types";

export const workoutsModule: ModuleDefinition = {
  slug: "workouts",
  name: "Workouts",
  icon: Dumbbell,
  tier: "pro",
  routes: [{ path: "workouts", title: "Workouts" }],
  dashboardWidgets: [WorkoutsWidget],
  quickAddActions: [
    {
      id: "workouts.new",
      label: "Log a workout",
      icon: Dumbbell,
      onPress: () => router.push("/modules/workouts/new"),
    },
  ],
  linkableEntities: [],
};
