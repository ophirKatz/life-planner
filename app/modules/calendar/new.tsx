import { Stack } from "expo-router";

import { NewEventScreen } from "@/modules/calendar/screens/NewEventScreen";
import { RouteSheet } from "@/core/ui/RouteSheet";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "none" }} />
      <RouteSheet>
        <NewEventScreen />
      </RouteSheet>
    </>
  );
}
