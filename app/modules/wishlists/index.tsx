import { Stack } from "expo-router";

import { WishlistsListScreen } from "@/modules/wishlists/screens/WishlistsListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WishlistsListScreen />
    </>
  );
}
