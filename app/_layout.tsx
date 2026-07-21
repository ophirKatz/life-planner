import "@/core/ui/theme/global.css";
import "@/core/notifications/handler";
import "@/modules";

import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { SessionProvider, useSession } from "@/core/auth/session";
import { initPurchases } from "@/core/billing/purchases";
import { ScheduledAsConfirmDialog } from "@/core/events/ScheduledAsConfirmDialog";
import { registerForPushNotifications } from "@/core/notifications/registerForPushNotifications";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function RootNavigator() {
  const { session, isLoading } = useSession();

  useEffect(() => {
    if (!session?.user.id) return;
    initPurchases(session.user.id);
    registerForPushNotifications();
  }, [session?.user.id]);

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
