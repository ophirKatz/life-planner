import { Stack } from "expo-router";

import { TripsListScreen } from "@/modules/travel/screens/TripsListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <TripsListScreen />
    </>
  );
}
