import { Stack } from "expo-router";

import { NewWishlistItemScreen } from "@/modules/wishlists/screens/NewWishlistItemScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Wishlist Item", presentation: "modal" }} />
      <NewWishlistItemScreen />
    </>
  );
}
