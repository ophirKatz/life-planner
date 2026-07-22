import { Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  useCreateTripItem,
  useDeleteTripItem,
  useToggleTripItemDone,
  useTripItems,
} from "@/modules/travel/data/useTripItems";
import type { TripItemType } from "@/modules/travel/types";
import { Button } from "@/core/ui/Button";
import { Checkbox } from "@/core/ui/Checkbox";
import { Input } from "@/core/ui/Input";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function TripItemsSection({
  tripId,
  type,
  label,
  placeholder,
  showCheckbox,
}: {
  tripId: string;
  type: TripItemType;
  label: string;
  placeholder: string;
  showCheckbox?: boolean;
}) {
  const { data: items, isLoading } = useTripItems(tripId, type);
  const createItem = useCreateTripItem(tripId, type);
  const toggleDone = useToggleTripItemDone(tripId, type);
  const deleteItem = useDeleteTripItem(tripId, type);
  const colors = useThemeColors();
  const [draft, setDraft] = useState("");

  const submit = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    createItem.mutate({ title: trimmed }, { onSuccess: () => setDraft("") });
  };

  return (
    <View className="gap-3">
      <Text className="text-sm font-medium text-muted-foreground">{label}</Text>

      <View className="flex-row items-center gap-2">
        <Input
          containerClassName="flex-1"
          value={draft}
          onChangeText={setDraft}
          placeholder={placeholder}
          onSubmitEditing={submit}
          returnKeyType="done"
        />
        <Button label="Add" size="sm" onPress={submit} isLoading={createItem.isPending} disabled={!draft.trim()} />
      </View>

      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : !items || items.length === 0 ? (
        <Text className="text-sm text-muted-foreground">Nothing here yet.</Text>
      ) : (
        <View className="gap-2">
          {items.map((item) => (
            <View key={item.id} className="flex-row items-center gap-2.5">
              {showCheckbox ? (
                <Checkbox checked={item.done} onCheckedChange={() => toggleDone.mutate(item)} />
              ) : null}
              <Text
                className={`text-sm flex-1 ${item.done && showCheckbox ? "text-muted-foreground line-through" : "text-foreground"}`}
              >
                {item.title}
              </Text>
              <Pressable hitSlop={8} onPress={() => deleteItem.mutate(item.id)}>
                <Trash2 size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
