import { Stack } from "expo-router";

import { SessionsListScreen } from "@/modules/climbing/screens/SessionsListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SessionsListScreen />
    </>
  );
}
