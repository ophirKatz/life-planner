import { AlertCircle } from "lucide-react-native";
import { ScrollView, Switch, Text, View } from "react-native";

import { getModuleIcon } from "@/core/modules/icon-map";
import { useModulesCatalog } from "@/core/modules/data/useModulesCatalog";
import { useSetModuleEnabled, useUserModules } from "@/core/modules/data/useUserModules";
import type { ModuleCatalogRow } from "@/core/modules/types";
import { EmptyState } from "@/core/ui/EmptyState";
import { SkeletonListItem } from "@/core/ui/Skeleton";

export default function StoreScreen() {
  const catalog = useModulesCatalog();
  const userModules = useUserModules();
  const setEnabled = useSetModuleEnabled();

  if (catalog.isLoading || userModules.isLoading) {
    return (
      <View className="flex-1 bg-bg px-6 pt-16 gap-3">
        <Text className="text-2xl font-semibold text-foreground mb-2">Store</Text>
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonListItem key={i} />
        ))}
      </View>
    );
  }

  if (catalog.isError || userModules.isError) {
    return (
      <View className="flex-1 bg-bg">
        <EmptyState
          icon={AlertCircle}
          title="Couldn't load the module store"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => {
            catalog.refetch();
            userModules.refetch();
          }}
        />
      </View>
    );
  }

  const enabledByModuleId = new Map(
    (userModules.data ?? []).map((um) => [um.module_id, um.enabled])
  );

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="px-6 pt-16 pb-10 gap-3">
      <Text className="text-2xl font-semibold text-foreground mb-2">Store</Text>

      {(catalog.data ?? []).map((moduleRow: ModuleCatalogRow) => {
        const Icon = getModuleIcon(moduleRow.icon);
        const isEnabled = enabledByModuleId.get(moduleRow.id) ?? false;

        return (
          <View
            key={moduleRow.id}
            className="flex-row items-center gap-4 rounded-2xl bg-surface p-4 border border-border"
          >
            <View className="h-11 w-11 rounded-xl bg-surface-muted items-center justify-center">
              <Icon size={22} color="#6366f1" />
            </View>

            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="text-base font-medium text-foreground">{moduleRow.name}</Text>
                {moduleRow.tier === "pro" ? (
                  <View className="rounded-full bg-accent px-2 py-0.5">
                    <Text className="text-xs font-medium text-accent-foreground">Pro</Text>
                  </View>
                ) : null}
              </View>
              <Text className="text-sm text-muted-foreground">{moduleRow.description}</Text>
            </View>

            <Switch
              value={isEnabled}
              disabled={setEnabled.isPending}
              onValueChange={(next) => setEnabled.mutate({ moduleId: moduleRow.id, enabled: next })}
              accessibilityLabel={`Toggle ${moduleRow.name} module`}
            />
          </View>
        );
      })}
    </ScrollView>
  );
}
