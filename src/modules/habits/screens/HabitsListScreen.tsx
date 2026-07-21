import { FlatList, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Flame, Plus } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { HabitRow } from "@/modules/habits/components/HabitRow";
import { useHabits } from "@/modules/habits/data/useHabits";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { SkeletonListItem } from "@/core/ui/Skeleton";

export function HabitsListScreen() {
  const router = useRouter();
  const { data: habits, isLoading, isError, refetch } = useHabits();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Habits</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/habits/new")}>
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
        <EmptyState icon={Flame} title="Couldn't load habits" actionLabel="Retry" onAction={() => refetch()} />
      ) : !habits || habits.length === 0 ? (
        <EmptyState
          icon={Flame}
          title="No habits yet"
          description="Add a habit to start building your streak."
          actionLabel="New habit"
          onAction={() => router.push("/modules/habits/new")}
        />
      ) : (
        <FlatList
          data={habits}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 24, gap: 10 }}
          renderItem={({ item }) => <HabitRow habit={item} />}
        />
      )}
    </SafeAreaView>
  );
}
