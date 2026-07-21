import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Plus, Users } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { usePeople } from "@/modules/people/data/usePeople";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListItem } from "@/core/ui/ListItem";
import { SkeletonListItem } from "@/core/ui/Skeleton";

export function PeopleListScreen() {
  const router = useRouter();
  const { data: people, isLoading, isError, refetch } = usePeople();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">People</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/people/new")}>
          <Plus size={20} />
        </Button>
      </View>

      {isLoading ? (
        <View className="px-6 gap-2 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState
          icon={Users}
          title="Couldn't load your contacts"
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !people || people.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No contacts yet"
          description="Add someone to link them to tasks and events."
          actionLabel="New contact"
          onAction={() => router.push("/modules/people/new")}
        />
      ) : (
        <FlashList
          data={people}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          ItemSeparatorComponent={() => <View className="h-2" />}
          renderItem={({ item }) => (
            <ListItem
              title={item.display_name}
              subtitle={item.emails[0] ?? item.phones[0]}
              showChevron
              onPress={() => router.push(`/modules/people/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}
