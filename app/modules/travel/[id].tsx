import { Stack, useLocalSearchParams } from "expo-router";

import { TripDetailScreen } from "@/modules/travel/screens/TripDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Trip" }} />
      <TripDetailScreen id={id} />
    </>
  );
}
