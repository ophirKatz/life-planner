import { Stack } from "expo-router";

import { WeatherScreen } from "@/modules/weather/screens/WeatherScreen";

export default function Screen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <WeatherScreen />
    </>
  );
}
