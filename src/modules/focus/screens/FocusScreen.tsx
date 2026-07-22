import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { isPaywallError } from "@/core/billing/paywall";
import { FocusDigest } from "@/modules/focus/components/FocusDigest";
import { useFocusSummary, useGenerateFocusSummary } from "@/modules/focus/data/useFocusSummary";
import type { FocusPeriod } from "@/modules/focus/types";
import { Skeleton } from "@/core/ui/Skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/core/ui/Tabs";

function FocusPeriodView({ period }: { period: FocusPeriod }) {
  const { data: cached, isLoading } = useFocusSummary(period);
  const generate = useGenerateFocusSummary(period);

  if (isLoading) {
    return (
      <View className="px-6 pt-4 gap-2">
        <Skeleton className="h-24 w-full" />
      </View>
    );
  }

  return (
    <View className="px-6 pt-4 gap-3">
      {generate.isError && !isPaywallError(generate.error) ? (
        <Text className="text-sm text-danger">Failed to generate a digest. Try again.</Text>
      ) : null}
      <FocusDigest
        payload={cached?.summary ?? null}
        period={period}
        onRegenerate={() => generate.mutate()}
        isRegenerating={generate.isPending}
      />
    </View>
  );
}

export function FocusScreen() {
  const [tab, setTab] = useState<FocusPeriod>("tomorrow");

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Focus</Text>
      </View>

      <Tabs value={tab} onValueChange={(value) => setTab(value as FocusPeriod)} className="flex-1">
        <View className="px-6">
          <TabsList>
            <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
            <TabsTrigger value="week">This week</TabsTrigger>
          </TabsList>
        </View>
        <TabsContent value="tomorrow" className="flex-1">
          <ScrollView contentContainerClassName="pb-10">
            <FocusPeriodView period="tomorrow" />
          </ScrollView>
        </TabsContent>
        <TabsContent value="week" className="flex-1">
          <ScrollView contentContainerClassName="pb-10">
            <FocusPeriodView period="week" />
          </ScrollView>
        </TabsContent>
      </Tabs>
    </SafeAreaView>
  );
}
