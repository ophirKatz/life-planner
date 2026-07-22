import { Lock, Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import { isPaywallError, presentPaywall } from "@/core/billing/paywall";
import { useSubscription } from "@/core/billing/data/useSubscription";
import { useGeneratePersonSummary, usePersonSummary } from "@/modules/people/data/usePersonSummary";
import { Button } from "@/core/ui/Button";
import { Card } from "@/core/ui/Card";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

/** AI-generated relationship recap — a pro feature inside the free People
 * module (DESIGN.md §7.3). Shows a locked upsell for free users instead of
 * hiding the card outright, so it's discoverable. */
export function PersonSummaryCard({ personId }: { personId: string }) {
  const colors = useThemeColors();
  const { data: subscription } = useSubscription();
  const { data: cached } = usePersonSummary(personId);
  const generate = useGeneratePersonSummary(personId);
  const isPro = !!subscription?.is_pro;

  const generateSummary = () => {
    generate.mutate(true, {
      onError: async (error) => {
        if (!isPaywallError(error)) return;
        await presentPaywall();
      },
    });
  };

  return (
    <Card className="gap-3">
      <View className="flex-row items-center gap-2">
        <Sparkles size={18} color={colors.accent} />
        <Text className="text-base font-semibold text-foreground flex-1">AI relationship summary</Text>
        {!isPro ? (
          <View className="rounded-full bg-accent px-2 py-0.5">
            <Text className="text-xs font-medium text-accent-foreground">Pro</Text>
          </View>
        ) : null}
      </View>

      {!isPro ? (
        <View className="items-center gap-2 py-2">
          <Lock size={20} color={colors.mutedForeground} />
          <Text className="text-sm text-muted-foreground text-center">
            Upgrade to get an AI-written recap of your interactions with this person.
          </Text>
          <Button label="Upgrade to Pro" size="sm" onPress={() => presentPaywall()} />
        </View>
      ) : (
        <>
          {generate.isPending ? (
            <Text className="text-sm text-muted-foreground">Generating…</Text>
          ) : generate.isError && !isPaywallError(generate.error) ? (
            <Text className="text-sm text-danger">Failed to generate a summary. Try again.</Text>
          ) : cached?.summary ? (
            <Text className="text-sm text-foreground">{cached.summary}</Text>
          ) : (
            <Text className="text-sm text-muted-foreground">No summary yet.</Text>
          )}

          <Button
            label={cached?.summary ? "Regenerate" : "Generate summary"}
            size="sm"
            variant="secondary"
            isLoading={generate.isPending}
            onPress={generateSummary}
          />
        </>
      )}
    </Card>
  );
}
