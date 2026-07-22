import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Plane, Plus } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTrips } from "@/modules/travel/data/useTrips";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListItem } from "@/core/ui/ListItem";
import { SkeletonListItem } from "@/core/ui/Skeleton";

export function TripsListScreen() {
  const router = useRouter();
  const { data: trips, isLoading, isError, refetch } = useTrips();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Travel</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/travel/new")}>
          <Plus size={20} />
        </Button>
      </View>

      {isLoading ? (
        <View className="px-6 gap-2 pt-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState icon={Plane} title="Couldn&apos;t load your trips" actionLabel="Retry" onAction={() => refetch()} />
      ) : !trips || trips.length === 0 ? (
        <EmptyState
          icon={Plane}
          title="No trips planned"
          description="Plan your next trip's itinerary and packing list."
          actionLabel="New trip"
          onAction={() => router.push("/modules/travel/new")}
        />
      ) : (
        <FlashList
          data={trips}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <ListItem
              title={item.name}
              subtitle={`${item.destination ? `${item.destination} · ` : ""}${format(new Date(item.start_date), "MMM d")} – ${format(new Date(item.end_date), "MMM d")}`}
              icon={Plane}
              showChevron
              onPress={() => router.push(`/modules/travel/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
