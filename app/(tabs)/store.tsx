import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react-native";
import { Pressable, ScrollView, Switch, Text, View } from "react-native";

import { isPaywallError, presentPaywall } from "@/core/billing/paywall";
import { getModuleIcon } from "@/core/modules/icon-map";
import { useModulesCatalog } from "@/core/modules/data/useModulesCatalog";
import {
  useSetModuleEnabled,
  useSwapModulePosition,
  useUserModules,
  type UserModuleRow,
} from "@/core/modules/data/useUserModules";
import type { ModuleCatalogRow } from "@/core/modules/types";
import { EmptyState } from "@/core/ui/EmptyState";
import { SkeletonListItem } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export default function StoreScreen() {
  const catalog = useModulesCatalog();
  const userModules = useUserModules();
  const setEnabled = useSetModuleEnabled();
  const swapPosition = useSwapModulePosition();
  const colors = useThemeColors();

  const enableModule = (moduleId: string, enabled: boolean) => {
    setEnabled.mutate(
      { moduleId, enabled },
      {
        onError: async (error) => {
          if (!enabled || !isPaywallError(error)) return;
          const purchased = await presentPaywall();
          if (purchased) setEnabled.mutate({ moduleId, enabled });
        },
      }
    );
  };

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

  const userModulesById = new Map((userModules.data ?? []).map((um) => [um.module_id, um]));
  const enabled = (userModules.data ?? []).filter((um) => um.enabled);
  const availableModules = (catalog.data ?? []).filter((m) => !userModulesById.get(m.id)?.enabled);

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="px-6 pt-16 pb-10 gap-6">
      <Text className="text-2xl font-semibold text-foreground">Store</Text>

      {enabled.length > 0 ? (
        <View className="gap-3">
          <Text className="text-sm font-medium text-muted-foreground">
            Your dashboard (drag order with the arrows)
          </Text>
          <View className="gap-2">
            {enabled.map((um, index) => (
              <View
                key={um.id}
                className="flex-row items-center gap-4 rounded-2xl bg-surface p-4 border border-border"
              >
                <ModuleIcon icon={um.module.icon} />
                <Text className="flex-1 text-base font-medium text-foreground">{um.module.name}</Text>

                <View className="gap-0.5">
                  <Pressable
                    disabled={index === 0}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${um.module.name} up`}
                    onPress={() => swapPosition.mutate({ a: um, b: enabled[index - 1] as UserModuleRow })}
                  >
                    <ChevronUp size={18} color={index === 0 ? "transparent" : colors.mutedForeground} />
                  </Pressable>
                  <Pressable
                    disabled={index === enabled.length - 1}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={`Move ${um.module.name} down`}
                    onPress={() => swapPosition.mutate({ a: um, b: enabled[index + 1] as UserModuleRow })}
                  >
                    <ChevronDown
                      size={18}
                      color={index === enabled.length - 1 ? "transparent" : colors.mutedForeground}
                    />
                  </Pressable>
                </View>

                <Switch
                  value
                  disabled={setEnabled.isPending}
                  onValueChange={() => enableModule(um.module_id, false)}
                  accessibilityLabel={`Disable ${um.module.name} module`}
                />
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <View className="gap-3">
        <Text className="text-sm font-medium text-muted-foreground">More modules</Text>
        <View className="gap-2">
          {availableModules.map((moduleRow: ModuleCatalogRow) => (
            <View
              key={moduleRow.id}
              className="flex-row items-center gap-4 rounded-2xl bg-surface p-4 border border-border"
            >
              <ModuleIcon icon={moduleRow.icon} />

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
                value={false}
                disabled={setEnabled.isPending}
                onValueChange={(next) => enableModule(moduleRow.id, next)}
                accessibilityLabel={`Toggle ${moduleRow.name} module`}
              />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

function ModuleIcon({ icon }: { icon: string }) {
  const Icon = getModuleIcon(icon);
  const colors = useThemeColors();
  return (
    <View className="h-11 w-11 rounded-xl bg-surface-muted items-center justify-center">
      <Icon size={22} color={colors.accent} />
    </View>
  );
}
