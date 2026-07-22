import { Stack } from "expo-router";

import { TransactionsListScreen } from "@/modules/budget/screens/TransactionsListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TransactionsListScreen />
    </>
  );
}
