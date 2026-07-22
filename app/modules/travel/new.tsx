import { Stack } from "expo-router";

import { NewTripScreen } from "@/modules/travel/screens/NewTripScreen";
import { RouteSheet } from "@/core/ui/RouteSheet";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "none" }} />
      <RouteSheet>
        <NewTripScreen />
      </RouteSheet>
    </>
  );
}
