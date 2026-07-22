import { Stack } from "expo-router";
import { ShieldAlert } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Switch, Text, View } from "react-native";

import { useUpdateModule, useAdminModules } from "@/core/admin/data/useAdminModules";
import { useFeatureFlags, useSetFeatureFlag } from "@/core/admin/data/useFeatureFlags";
import { useIsAdmin } from "@/core/admin/useIsAdmin";
import { getModuleIcon } from "@/core/modules/icon-map";
import type { ModuleTier } from "@/core/modules/types";
import { EmptyState } from "@/core/ui/EmptyState";
import { OptionButtonGroup } from "@/core/ui/OptionButtonGroup";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

const TIER_OPTIONS: { value: ModuleTier; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
];

export default function AdminScreen() {
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ title: "Admin" }} />

      {isAdminLoading ? (
        <ActivityIndicator className="mt-10" />
      ) : !isAdmin ? (
        <EmptyState
          icon={ShieldAlert}
          title="Not authorized"
          description="This screen is only available to admin accounts."
        />
      ) : (
        <AdminDashboard />
      )}
    </View>
  );
}

function AdminDashboard() {
  const modules = useAdminModules();
  const updateModule = useUpdateModule();
  const flags = useFeatureFlags();
  const setFlag = useSetFeatureFlag();
  const colors = useThemeColors();

  return (
    <ScrollView contentContainerClassName="px-6 pt-6 pb-10 gap-8">
      <View className="gap-1">
        <Text className="text-sm text-muted-foreground">
          Module availability and tier apply to every user immediately — flip is_active off to hide a
          module app-wide, or change its tier to move it between free and pro.
        </Text>
      </View>

      <View className="gap-3">
        <Text className="text-sm font-medium text-muted-foreground">Modules</Text>
        {modules.isLoading ? (
          <ActivityIndicator />
        ) : (
          <View className="gap-2">
            {(modules.data ?? []).map((moduleRow) => {
              const Icon = getModuleIcon(moduleRow.icon);
              return (
                <View
                  key={moduleRow.id}
                  className="gap-3 rounded-2xl bg-surface p-4 border border-border"
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 rounded-xl bg-surface-muted items-center justify-center">
                      <Icon size={20} color={colors.accent} />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-medium text-foreground">{moduleRow.name}</Text>
                      <Text className="text-xs text-muted-foreground" numberOfLines={1}>
                        {moduleRow.slug}
                      </Text>
                    </View>
                    <Switch
                      value={moduleRow.is_active}
                      disabled={updateModule.isPending}
                      onValueChange={(is_active) => updateModule.mutate({ moduleId: moduleRow.id, patch: { is_active } })}
                      accessibilityLabel={`${moduleRow.is_active ? "Disable" : "Enable"} ${moduleRow.name} module`}
                    />
                  </View>
                  <OptionButtonGroup
                    options={TIER_OPTIONS}
                    value={moduleRow.tier as ModuleTier}
                    onChange={(tier) => updateModule.mutate({ moduleId: moduleRow.id, patch: { tier } })}
                  />
                </View>
              );
            })}
          </View>
        )}
      </View>

      <View className="gap-3">
        <Text className="text-sm font-medium text-muted-foreground">Feature flags</Text>
        {flags.isLoading ? (
          <ActivityIndicator />
        ) : (
          <View className="gap-2">
            {(flags.data ?? []).map((flag) => (
              <View
                key={flag.key}
                className="flex-row items-center gap-3 rounded-2xl bg-surface p-4 border border-border"
              >
                <View className="flex-1">
                  <Text className="text-base font-medium text-foreground">{flag.name}</Text>
                  <Text className="text-xs text-muted-foreground">{flag.description}</Text>
                </View>
                <Switch
                  value={flag.enabled}
                  disabled={setFlag.isPending}
                  onValueChange={(enabled) => setFlag.mutate({ key: flag.key, enabled })}
                  accessibilityLabel={`${flag.enabled ? "Disable" : "Enable"} ${flag.name}`}
                />
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
