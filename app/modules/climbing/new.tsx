import { Stack } from "expo-router";

import { NewSessionScreen } from "@/modules/climbing/screens/NewSessionScreen";
import { RouteSheet } from "@/core/ui/RouteSheet";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "none" }} />
      <RouteSheet>
        <NewSessionScreen />
      </RouteSheet>
    </>
  );
}
