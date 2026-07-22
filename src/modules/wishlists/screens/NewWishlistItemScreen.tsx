import { useRouter } from "expo-router";
import { Text } from "react-native";

import { WishlistItemForm } from "@/modules/wishlists/components/WishlistItemForm";
import { useCreateWishlistItem } from "@/modules/wishlists/data/useWishlistItems";

export function NewWishlistItemScreen() {
  const router = useRouter();
  const createItem = useCreateWishlistItem();

  return (
    <>
      <Text className="text-lg font-semibold text-foreground text-center mb-4">New wishlist item</Text>
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
    </>
  );
}
