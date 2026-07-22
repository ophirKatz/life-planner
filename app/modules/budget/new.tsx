import { Stack } from "expo-router";

import { NewTransactionScreen } from "@/modules/budget/screens/NewTransactionScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Transaction", presentation: "modal" }} />
      <NewTransactionScreen />
    </>
  );
}
