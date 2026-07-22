import { Stack } from "expo-router";

import { IdeasListScreen } from "@/modules/ideas/screens/IdeasListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <IdeasListScreen />
    </>
  );
}
