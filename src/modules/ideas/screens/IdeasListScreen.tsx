import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { Lightbulb, Plus } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useIdeas } from "@/modules/ideas/data/useIdeas";
import type { IdeaRow, IdeaStatus } from "@/modules/ideas/types";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListRow } from "@/core/ui/ListRow";
import { SkeletonListItem } from "@/core/ui/Skeleton";

const STATUS_LABEL: Record<IdeaStatus, string> = {
  new: "New",
  exploring: "Exploring",
  done: "Done",
  archived: "Archived",
};

const STATUS_COLOR: Record<IdeaStatus, string> = {
  new: "#5b57f0",
  exploring: "#f59e0b",
  done: "#22c55e",
  archived: "#6b7280",
};

function IdeaRowItem({ idea }: { idea: IdeaRow }) {
  const router = useRouter();
  const status = idea.status as IdeaStatus;

  return (
    <ListRow
      leading={{ type: "dot", color: STATUS_COLOR[status] }}
      title={idea.title}
      subtitle={idea.tags.length > 0 ? idea.tags.join(", ") : undefined}
      trailing={<Text className="text-xs text-muted-foreground shrink-0">{STATUS_LABEL[status]}</Text>}
      onPress={() => router.push(`/modules/ideas/${idea.id}`)}
    />
  );
}

export function IdeasListScreen() {
  const router = useRouter();
  const { data: ideas, isLoading, isError, refetch } = useIdeas();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Idea Log</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/ideas/new")}>
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
          icon={Lightbulb}
          title="Couldn&apos;t load ideas"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={() => refetch()}
        />
      ) : !ideas || ideas.length === 0 ? (
        <EmptyState
          icon={Lightbulb}
          title="No ideas yet"
          description="Capture a thought before it slips away."
          actionLabel="New idea"
          onAction={() => router.push("/modules/ideas/new")}
        />
      ) : (
        <FlashList
          data={ideas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <IdeaRowItem idea={item} />}
        />
      )}
    </SafeAreaView>
  );
}
