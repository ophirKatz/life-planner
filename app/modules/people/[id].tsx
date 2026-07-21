import { Stack, useLocalSearchParams } from "expo-router";

import { PersonDetailScreen } from "@/modules/people/screens/PersonDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Contact" }} />
      <PersonDetailScreen id={id} />
    </>
  );
}
