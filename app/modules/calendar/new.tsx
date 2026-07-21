import { Stack } from "expo-router";

import { NewEventScreen } from "@/modules/calendar/screens/NewEventScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Event", presentation: "modal" }} />
      <NewEventScreen />
    </>
  );
}
