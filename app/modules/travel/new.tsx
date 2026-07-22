import { Stack } from "expo-router";

import { NewTripScreen } from "@/modules/travel/screens/NewTripScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Trip", presentation: "modal" }} />
      <NewTripScreen />
    </>
  );
}
