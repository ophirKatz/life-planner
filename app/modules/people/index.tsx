import { Stack } from "expo-router";

import { PeopleListScreen } from "@/modules/people/screens/PeopleListScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PeopleListScreen />
    </>
  );
}
