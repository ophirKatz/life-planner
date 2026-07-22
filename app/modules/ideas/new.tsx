import { Stack } from "expo-router";

import { NewIdeaScreen } from "@/modules/ideas/screens/NewIdeaScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ title: "New Idea", presentation: "modal" }} />
      <NewIdeaScreen />
    </>
  );
}
