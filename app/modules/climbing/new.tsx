import { Stack } from "expo-router";

import { NewSessionScreen } from "@/modules/climbing/screens/NewSessionScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Session", presentation: "modal" }} />
      <NewSessionScreen />
    </>
  );
}
