import { FlashList } from "@shopify/flash-list";
import { ChevronDown, ChevronUp, ShoppingCart, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useAddShoppingItem,
  useDeleteShoppingItem,
  useShoppingItems,
  useSwapShoppingItemPosition,
  useToggleShoppingItem,
} from "@/modules/shopping/data/useShoppingItems";
import type { ShoppingItemRow } from "@/modules/shopping/types";
import { Button } from "@/core/ui/Button";
import { Checkbox } from "@/core/ui/Checkbox";
import { EmptyState } from "@/core/ui/EmptyState";
import { Input } from "@/core/ui/Input";
import { SkeletonListItem } from "@/core/ui/Skeleton";
import { SwipeableRow } from "@/core/ui/SwipeableRow";

export function ShoppingItemsScreen({ listId }: { listId: string }) {
  const { data: items, isLoading, isError, refetch } = useShoppingItems(listId);
  const addItem = useAddShoppingItem(listId);
  const toggleItem = useToggleShoppingItem(listId);
  const deleteItem = useDeleteShoppingItem(listId);
  const swapPosition = useSwapShoppingItemPosition(listId);
  const [draft, setDraft] = useState("");

  const submitDraft = () => {
    const name = draft.trim();
    if (!name) return;
    addItem.mutate(name);
    setDraft("");
  };

  return (
    <SafeAreaView edges={["bottom"]} className="flex-1 bg-bg">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        {isLoading ? (
          <View className="px-6 gap-2 pt-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonListItem key={i} />
            ))}
          </View>
        ) : isError ? (
          <EmptyState
            icon={ShoppingCart}
            title="Couldn't load this list"
            actionLabel="Retry"
            onAction={() => refetch()}
          />
        ) : !items || items.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="Nothing on this list yet" />
        ) : (
          <FlashList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ShoppingItemRowView
                item={item}
                previous={items[index - 1]}
                next={items[index + 1]}
                onToggle={() => toggleItem.mutate(item)}
                onDelete={() => deleteItem.mutate(item.id)}
                onMoveUp={(neighbor) => swapPosition.mutate({ a: item, b: neighbor })}
                onMoveDown={(neighbor) => swapPosition.mutate({ a: item, b: neighbor })}
              />
            )}
          />
        )}

        <View className="flex-row items-center gap-2 px-6 py-3 border-t border-border bg-surface">
          <Input
            containerClassName="flex-1"
            value={draft}
            onChangeText={setDraft}
            placeholder="Add an item…"
            onSubmitEditing={submitDraft}
            returnKeyType="done"
          />
          <Button label="Add" size="sm" onPress={submitDraft} isLoading={addItem.isPending} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ShoppingItemRowView({
  item,
  previous,
  next,
  onToggle,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  item: ShoppingItemRow;
  previous?: ShoppingItemRow;
  next?: ShoppingItemRow;
  onToggle: () => void;
  onDelete: () => void;
  onMoveUp: (neighbor: ShoppingItemRow) => void;
  onMoveDown: (neighbor: ShoppingItemRow) => void;
}) {
  return (
    <SwipeableRow
      actionLabel="Remove"
      actionIcon={Trash2}
      actionColorClassName="bg-danger"
      onTrigger={onDelete}
    >
      <View className="flex-row items-center gap-3 bg-bg px-6 py-3">
        <Checkbox checked={item.checked} onCheckedChange={onToggle} />
        <View className="flex-1">
          <Text
            className={`text-base ${item.checked ? "text-muted-foreground line-through" : "text-foreground"}`}
          >
            {item.name}
          </Text>
          {item.category ? (
            <Text className="text-xs text-muted-foreground">{item.category}</Text>
          ) : null}
        </View>
        <View className="gap-0.5">
          <Pressable disabled={!previous} onPress={() => previous && onMoveUp(previous)} hitSlop={8}>
            <ChevronUp size={18} color={previous ? "hsl(220 9% 46%)" : "transparent"} />
          </Pressable>
          <Pressable disabled={!next} onPress={() => next && onMoveDown(next)} hitSlop={8}>
            <ChevronDown size={18} color={next ? "hsl(220 9% 46%)" : "transparent"} />
          </Pressable>
        </View>
      </View>
    </SwipeableRow>
  );
}
