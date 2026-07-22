import { Stack } from "expo-router";

import { NewTaskScreen } from "@/modules/tasks/screens/NewTaskScreen";
import { RouteSheet } from "@/core/ui/RouteSheet";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "none" }} />
      <RouteSheet>
        <NewTaskScreen />
      </RouteSheet>
    </>
  );
}
