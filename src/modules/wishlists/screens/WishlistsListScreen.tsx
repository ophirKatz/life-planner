import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Bookmark, Plus } from "lucide-react-native";
import { useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useWishlistItems } from "@/modules/wishlists/data/useWishlistItems";
import type { WishlistItemRow, WishlistItemType } from "@/modules/wishlists/types";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListRow } from "@/core/ui/ListRow";
import { OptionButtonGroup } from "@/core/ui/OptionButtonGroup";
import { SkeletonListItem } from "@/core/ui/Skeleton";

const TYPE_LABEL: Record<WishlistItemType, string> = {
  movie: "Movie",
  tv: "TV",
  book: "Book",
  game: "Game",
  other: "Other",
};

const TYPE_FILTERS: { value: WishlistItemType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "TV" },
  { value: "book", label: "Books" },
  { value: "game", label: "Games" },
];

function WishlistRowItem({ item }: { item: WishlistItemRow }) {
  const router = useRouter();
  const done = item.status === "done";
  const subtitle = `${TYPE_LABEL[item.type as WishlistItemType]}${item.rating ? ` · ${"★".repeat(item.rating)}` : ""}`;

  return (
    <ListRow
      title={item.title}
      titleDone={done}
      subtitle={subtitle}
      trailing={item.status === "in_progress" ? <Text className="text-xs text-accent shrink-0">In progress</Text> : null}
      onPress={() => router.push(`/modules/wishlists/${item.id}`)}
    />
  );
}

export function WishlistsListScreen() {
  const router = useRouter();
  const { data: items, isLoading, isError, refetch } = useWishlistItems();
  const [filter, setFilter] = useState<WishlistItemType | "all">("all");

  const filtered = (items ?? []).filter((item) => filter === "all" || item.type === filter);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Wishlist</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/wishlists/new")}>
          <Plus size={20} />
        </Button>
      </View>

      <View className="px-6 pb-3">
        <OptionButtonGroup options={TYPE_FILTERS} value={filter} onChange={setFilter} wrap />
      </View>

      {isLoading ? (
        <View className="px-6 gap-2 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={Bookmark}
          title="Couldn&apos;t load your wishlist"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing here yet"
          description="Add a movie, show, book, or game to come back to."
          actionLabel="New item"
          onAction={() => router.push("/modules/wishlists/new")}
        />
      ) : (
        <FlashList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <WishlistRowItem item={item} />}
        />
      )}
    </SafeAreaView>
  );
}
