import { Stack, useLocalSearchParams } from "expo-router";

import { IdeaDetailScreen } from "@/modules/ideas/screens/IdeaDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Idea" }} />
      <IdeaDetailScreen id={id} />
    </>
  );
}
