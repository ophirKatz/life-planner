import { format } from "date-fns";
import { MessageCircle, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";

import {
  useDeletePersonInteraction,
  useLogPersonInteraction,
  usePersonInteractions,
} from "@/modules/people/data/usePersonInteractions";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function InteractionsSection({ personId }: { personId: string }) {
  const { data: interactions, isLoading } = usePersonInteractions(personId);
  const logInteraction = useLogPersonInteraction(personId);
  const deleteInteraction = useDeletePersonInteraction(personId);
  const colors = useThemeColors();
  const [note, setNote] = useState("");

  const submit = () => {
    const trimmed = note.trim();
    if (!trimmed) return;
    logInteraction.mutate({ note: trimmed }, { onSuccess: () => setNote("") });
  };

  return (
    <View className="gap-3">
      <Text className="text-sm font-medium text-muted-foreground">Interactions</Text>

      <View className="flex-row items-center gap-2">
        <Input
          containerClassName="flex-1"
          value={note}
          onChangeText={setNote}
          placeholder="Log a call, coffee, catch-up…"
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <Button label="Log" size="sm" onPress={submit} isLoading={logInteraction.isPending} disabled={!note.trim()} />
      </View>

      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : !interactions || interactions.length === 0 ? (
        <Text className="text-sm text-muted-foreground">No interactions logged yet.</Text>
      ) : (
        <View className="gap-2">
          {interactions.map((interaction) => (
            <View
              key={interaction.id}
              className="flex-row items-start gap-2.5 rounded-xl bg-surface border border-border p-3"
            >
              <View className="mt-0.5">
                <MessageCircle size={14} color={colors.mutedForeground} />
              </View>
              <View className="flex-1">
                <Text className="text-xs text-muted-foreground">
                  {format(new Date(interaction.interaction_date), "MMM d, yyyy")}
                </Text>
                {interaction.note ? (
                  <Text className="text-sm text-foreground mt-0.5">{interaction.note}</Text>
                ) : null}
              </View>
              <Button
                size="icon"
                variant="ghost"
                accessibilityLabel="Delete interaction"
                onPress={() => deleteInteraction.mutate(interaction.id)}
              >
                <Trash2 size={16} color={colors.mutedForeground} />
              </Button>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
