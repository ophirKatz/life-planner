import { router } from "expo-router";
import { Wallet } from "lucide-react-native";

import { BudgetWidget } from "@/modules/budget/components/BudgetWidget";
import type { ModuleDefinition } from "@/core/modules/types";

export const budgetModule: ModuleDefinition = {
  slug: "budget",
  name: "Budget",
  icon: Wallet,
  tier: "pro",
  routes: [{ path: "budget", title: "Budget" }],
  dashboardWidgets: [BudgetWidget],
  quickAddActions: [
    {
      id: "budget.new",
      label: "Log a transaction",
      icon: Wallet,
      onPress: () => router.push("/modules/budget/new"),
    },
  ],
  linkableEntities: [],
};
