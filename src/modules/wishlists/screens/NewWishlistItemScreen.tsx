import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WishlistItemForm } from "@/modules/wishlists/components/WishlistItemForm";
import { useCreateWishlistItem } from "@/modules/wishlists/data/useWishlistItems";

export function NewWishlistItemScreen() {
  const router = useRouter();
  const createItem = useCreateWishlistItem();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">New wishlist item</Text>
        <WishlistItemForm
          submitLabel="Add to wishlist"
          isSubmitting={createItem.isPending}
          defaultValues={{ title: "", type: "movie", status: "want", rating: 0, notes: "", url: "" }}
          onSubmit={(values) => {
            createItem.mutate(
              {
                title: values.title,
                type: values.type,
                status: values.status,
                rating: values.rating || null,
                notes: values.notes || null,
                url: values.url || null,
              },
              { onSuccess: () => router.back() }
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
