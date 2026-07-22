import { router } from "expo-router";
import { Bookmark } from "lucide-react-native";

import { WishlistWidget } from "@/modules/wishlists/components/WishlistWidget";
import type { ModuleDefinition } from "@/core/modules/types";

export const wishlistsModule: ModuleDefinition = {
  slug: "wishlists",
  name: "Wishlist",
  icon: Bookmark,
  tier: "pro",
  routes: [{ path: "wishlists", title: "Wishlist" }],
  dashboardWidgets: [WishlistWidget],
  quickAddActions: [
    {
      id: "wishlists.new",
      label: "Add to wishlist",
      icon: Bookmark,
      onPress: () => router.push("/modules/wishlists/new"),
    },
  ],
  linkableEntities: [],
};
