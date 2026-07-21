import { Stack } from "expo-router";

import { ShoppingListsScreen } from "@/modules/shopping/screens/ShoppingListsScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ShoppingListsScreen />
    </>
  );
}
