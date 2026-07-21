import { Stack } from "expo-router";
import { Calendar, Trash2 } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { useConnectedAccounts, useDisconnectAccount } from "@/core/integrations/data/useConnectedAccounts";
import { useConnectGoogleCalendar } from "@/core/integrations/useConnectGoogleCalendar";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListItem } from "@/core/ui/ListItem";

export default function IntegrationsScreen() {
  const { data: accounts, isLoading } = useConnectedAccounts();
  const { connect, isConnecting, error } = useConnectGoogleCalendar();
  const disconnect = useDisconnectAccount();

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ title: "Integrations" }} />

      <ScrollView contentContainerClassName="px-6 pt-6 pb-10 gap-6">
        <View>
          <Text className="text-sm font-medium text-muted-foreground mb-3">Connected accounts</Text>

          {isLoading ? (
            <ActivityIndicator />
          ) : !accounts || accounts.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="No accounts connected"
              description="Connect Google to sync your Calendar events."
            />
          ) : (
            <View className="gap-2">
              {accounts.map((account) => (
                <ListItem
                  key={account.id}
                  title="Google Calendar"
                  subtitle={account.email ?? account.provider_account_id ?? undefined}
                  icon={Calendar}
                  trailing={
                    <Button
                      size="icon"
                      variant="ghost"
                      isLoading={disconnect.isPending}
                      onPress={() => account.id && disconnect.mutate(account.id)}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </Button>
                  }
                />
              ))}
            </View>
          )}
        </View>

        <Button
          label="Connect Google Calendar"
          isLoading={isConnecting}
          onPress={connect}
        />

        {error ? <Text className="text-sm text-danger text-center">{error}</Text> : null}

        <Text className="text-xs text-muted-foreground text-center">
          Requires a Google OAuth client configured in Supabase Auth and
          EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID set — see the README.
        </Text>
      </ScrollView>
    </View>
  );
}
