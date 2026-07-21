import { router } from "expo-router";
import { ShoppingCart } from "lucide-react-native";

import { ShoppingWidget } from "@/modules/shopping/components/ShoppingWidget";
import type { ModuleDefinition } from "@/core/modules/types";

export const shoppingModule: ModuleDefinition = {
  slug: "shopping",
  name: "Shopping",
  icon: ShoppingCart,
  tier: "free",
  routes: [{ path: "shopping", title: "Shopping" }],
  dashboardWidgets: [ShoppingWidget],
  quickAddActions: [
    {
      id: "shopping.open",
      label: "Add to shopping list",
      icon: ShoppingCart,
      onPress: () => router.push("/modules/shopping"),
    },
  ],
  linkableEntities: [],
};
