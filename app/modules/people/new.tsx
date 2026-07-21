import { Stack } from "expo-router";

import { NewPersonScreen } from "@/modules/people/screens/NewPersonScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Contact", presentation: "modal" }} />
      <NewPersonScreen />
    </>
  );
}
