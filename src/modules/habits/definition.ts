import { router } from "expo-router";
import { Flame } from "lucide-react-native";

import { HabitsWidget } from "@/modules/habits/components/HabitsWidget";
import type { ModuleDefinition } from "@/core/modules/types";

export const habitsModule: ModuleDefinition = {
  slug: "habits",
  name: "Habits",
  icon: Flame,
  tier: "pro",
  routes: [{ path: "habits", title: "Habits" }],
  dashboardWidgets: [HabitsWidget],
  quickAddActions: [
    {
      id: "habits.new",
      label: "New habit",
      icon: Flame,
      onPress: () => router.push("/modules/habits/new"),
    },
  ],
  linkableEntities: [],
};
