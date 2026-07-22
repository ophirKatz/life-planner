import { useRouter } from "expo-router";
import { Plus, ShoppingCart } from "lucide-react-native";
import { useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  useCreateShoppingList,
  useShoppingLists,
} from "@/modules/shopping/data/useShoppingLists";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { Input } from "@/core/ui/Input";
import { ListItem } from "@/core/ui/ListItem";
import { Sheet, SheetContent, SheetTrigger } from "@/core/ui/Sheet";
import { SkeletonListItem } from "@/core/ui/Skeleton";

function NewListSheet() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const createList = useCreateShoppingList();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="icon" variant="secondary">
          <Plus size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <Text className="text-lg font-semibold text-foreground text-center">New shopping list</Text>
        <Text className="text-sm text-muted-foreground text-center">
          Give it a name, e.g. &ldquo;Groceries&rdquo; or &ldquo;Hardware store&rdquo;.
        </Text>
        <Input value={name} onChangeText={setName} placeholder="List name" autoFocus />
        <Button
          label="Create list"
          isLoading={createList.isPending}
          disabled={!name.trim()}
          onPress={() =>
            createList.mutate(name.trim(), {
              onSuccess: () => {
                setName("");
                setOpen(false);
              },
            })
          }
        />
      </SheetContent>
    </Sheet>
  );
}

export function ShoppingListsScreen() {
  const router = useRouter();
  const { data: lists, isLoading, isError, refetch } = useShoppingLists();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Shopping</Text>
        <NewListSheet />
      </View>

      {isLoading ? (
        <View className="px-6 gap-2 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={ShoppingCart}
          title="Couldn't load your lists"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !lists || lists.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="No shopping lists yet"
          description="Create a list to start adding items."
        />
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              icon={ShoppingCart}
              showChevron
              onPress={() => router.push(`/modules/shopping/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
