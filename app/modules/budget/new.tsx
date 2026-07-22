import { Stack } from "expo-router";

import { NewTransactionScreen } from "@/modules/budget/screens/NewTransactionScreen";
import { RouteSheet } from "@/core/ui/RouteSheet";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "none" }} />
      <RouteSheet>
        <NewTransactionScreen />
      </RouteSheet>
    </>
  );
}
