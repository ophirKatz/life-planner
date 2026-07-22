import { Stack, useLocalSearchParams } from "expo-router";

import { SessionDetailScreen } from "@/modules/climbing/screens/SessionDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Session" }} />
      <SessionDetailScreen id={id} />
    </>
  );
}
