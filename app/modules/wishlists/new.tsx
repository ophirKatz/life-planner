import { Stack } from "expo-router";

import { NewWishlistItemScreen } from "@/modules/wishlists/screens/NewWishlistItemScreen";
import { RouteSheet } from "@/core/ui/RouteSheet";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "none" }} />
      <RouteSheet>
        <NewWishlistItemScreen />
      </RouteSheet>
    </>
  );
}
