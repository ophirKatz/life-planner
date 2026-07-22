import { Calendar, ListTodo } from "lucide-react-native";
import { Text, View } from "react-native";

import type { FocusPeriod, FocusSummaryPayload } from "@/modules/focus/types";
import { Button } from "@/core/ui/Button";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function FocusDigest({
  payload,
  period,
  onRegenerate,
  isRegenerating,
}: {
  payload: FocusSummaryPayload | null;
  period: FocusPeriod;
  onRegenerate: () => void;
  isRegenerating: boolean;
}) {
  const colors = useThemeColors();

  if (!payload) {
    return (
      <View className="items-center gap-3 py-6">
        <Text className="text-sm text-muted-foreground text-center">
          {period === "tomorrow" ? "No digest for tomorrow yet." : "No digest for this week yet."}
        </Text>
        <Button label="Generate" size="sm" onPress={onRegenerate} isLoading={isRegenerating} />
      </View>
    );
  }

  return (
    <View className="gap-4">
      {payload.type === "text" ? (
        <Text className="text-sm text-foreground">{payload.text}</Text>
      ) : (
        <>
          {payload.note ? <Text className="text-sm text-muted-foreground">{payload.note}</Text> : null}
          {payload.cards.map((card, i) => (
            <View key={`${card.label}-${i}`} className="rounded-2xl bg-surface border border-border p-3.5 gap-2">
              <Text className="text-sm font-semibold text-foreground">{card.label}</Text>
              {card.insight ? <Text className="text-xs text-muted-foreground">{card.insight}</Text> : null}
              <View className="gap-1.5 mt-1">
                {card.items.map((item) => {
                  const Icon = item.type === "task" ? ListTodo : Calendar;
                  return (
                    <View key={`${item.type}-${item.id}`} className="flex-row items-center gap-2">
                      <Icon size={13} color={colors.mutedForeground} />
                      <Text className="text-sm text-foreground flex-1" numberOfLines={1}>
                        {item.title}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </>
      )}

      <Button label="Regenerate" size="sm" variant="secondary" onPress={onRegenerate} isLoading={isRegenerating} />
    </View>
  );
}
