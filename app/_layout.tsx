import "@/core/ui/theme/global.css";
import "@/modules";

import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SessionProvider, useSession } from "@/core/auth/session";
import { ScheduledAsConfirmDialog } from "@/core/events/ScheduledAsConfirmDialog";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RootNavigator() {
  const { session, isLoading } = useSession();

  if (isLoading) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!session}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={!!session}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="modules" />
        <Stack.Screen name="integrations" options={{ headerShown: true, presentation: "modal" }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SessionProvider>
            <RootNavigator />
            <StatusBar style="auto" />
            <PortalHost />
            <ScheduledAsConfirmDialog />
          </SessionProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
