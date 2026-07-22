import { Stack } from "expo-router";

import { NewPersonScreen } from "@/modules/people/screens/NewPersonScreen";
import { RouteSheet } from "@/core/ui/RouteSheet";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "none" }} />
      <RouteSheet>
        <NewPersonScreen />
      </RouteSheet>
    </>
  );
}
