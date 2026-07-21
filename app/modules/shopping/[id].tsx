import { Stack, useLocalSearchParams } from "expo-router";

import { ShoppingItemsScreen } from "@/modules/shopping/screens/ShoppingItemsScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "List" }} />
      <ShoppingItemsScreen listId={id} />
    </>
  );
}
