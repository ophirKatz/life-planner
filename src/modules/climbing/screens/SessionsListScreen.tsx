import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Mountain, Plus } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useClimbingSessions } from "@/modules/climbing/data/useClimbingSessions";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListItem } from "@/core/ui/ListItem";
import { SkeletonListItem } from "@/core/ui/Skeleton";

export function SessionsListScreen() {
  const router = useRouter();
  const { data: sessions, isLoading, isError, refetch } = useClimbingSessions();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Climbing</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/climbing/new")}>
          <Plus size={20} />
        </Button>
      </View>

      {isLoading ? (
        <View className="px-6 gap-2 pt-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={Mountain}
          title="Couldn&apos;t load your sessions"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !sessions || sessions.length === 0 ? (
        <EmptyState
          icon={Mountain}
          title="No sessions logged yet"
          description="Log a session to start tracking your climbing."
          actionLabel="New session"
          onAction={() => router.push("/modules/climbing/new")}
        />
      ) : (
        <FlashList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <ListItem
              title={format(new Date(item.session_date), "EEEE, MMM d")}
              subtitle={item.location ?? undefined}
              icon={Mountain}
              showChevron
              onPress={() => router.push(`/modules/climbing/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
