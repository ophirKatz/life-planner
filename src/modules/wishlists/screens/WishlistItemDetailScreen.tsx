import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { ActivityIndicator, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WishlistItemForm } from "@/modules/wishlists/components/WishlistItemForm";
import { useDeleteWishlistItem, useUpdateWishlistItem, useWishlistItem } from "@/modules/wishlists/data/useWishlistItems";
import type { WishlistItemStatus, WishlistItemType } from "@/modules/wishlists/types";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";

export function WishlistItemDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: item, isLoading, isError } = useWishlistItem(id);
  const updateItem = useUpdateWishlistItem();
  const deleteItem = useDeleteWishlistItem();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !item) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Item not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 gap-6">
        <WishlistItemForm
          submitLabel="Save changes"
          isSubmitting={updateItem.isPending}
          defaultValues={{
            title: item.title,
            type: item.type as WishlistItemType,
            status: item.status as WishlistItemStatus,
            rating: item.rating ?? 0,
            notes: item.notes ?? "",
            url: item.url ?? "",
          }}
          onSubmit={(values) => {
            updateItem.mutate({
              id: item.id,
              patch: {
                title: values.title,
                type: values.type,
                status: values.status,
                rating: values.rating || null,
                notes: values.notes || null,
                url: values.url || null,
              },
            });
          }}
        />

        <Button
          label="Remove from wishlist"
          variant="destructive"
          isLoading={deleteItem.isPending}
          onPress={() => deleteItem.mutate(item.id, { onSuccess: () => router.back() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
