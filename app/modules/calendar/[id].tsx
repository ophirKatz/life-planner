import { Stack, useLocalSearchParams } from "expo-router";

import { EventDetailScreen } from "@/modules/calendar/screens/EventDetailScreen";

export default function Screen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen options={{ title: "Event" }} />
      <EventDetailScreen id={id} />
    </>
  );
}
