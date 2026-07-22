import { Stack, useLocalSearchParams } from "expo-router";

import { WishlistItemDetailScreen } from "@/modules/wishlists/screens/WishlistItemDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Wishlist Item" }} />
      <WishlistItemDetailScreen id={id} />
    </>
  );
}
