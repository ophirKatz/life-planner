import { useRouter } from "expo-router";
import { AlertTriangle, ListTodo } from "lucide-react-native";
import { ActivityIndicator, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LinkEntityButton } from "@/core/links/LinkEntityButton";
import { LinkedItemsSection } from "@/core/links/LinkedItemsSection";
import { IdeaForm } from "@/modules/ideas/components/IdeaForm";
import { useDeleteIdea, useIdea, useUpdateIdea } from "@/modules/ideas/data/useIdeas";
import type { IdeaStatus } from "@/modules/ideas/types";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";

function parseTags(input?: string): string[] {
  return (input ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function IdeaDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: idea, isLoading, isError } = useIdea(id);
  const updateIdea = useUpdateIdea();
  const deleteIdea = useDeleteIdea();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !idea) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Idea not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 gap-6">
        <IdeaForm
          submitLabel="Save changes"
          isSubmitting={updateIdea.isPending}
          defaultValues={{
            title: idea.title,
            description: idea.description ?? "",
            tags: idea.tags.join(", "),
            status: idea.status as IdeaStatus,
          }}
          onSubmit={(values) => {
            updateIdea.mutate({
              id: idea.id,
              patch: {
                title: values.title,
                description: values.description || null,
                tags: parseTags(values.tags),
                status: values.status,
              },
            });
          }}
        />

        <View className="flex-row flex-wrap gap-2">
          <LinkEntityButton
            label="Turn into a task"
            icon={ListTodo}
            pickerTitle="Link a task"
            sourceType="idea"
            sourceId={idea.id}
            targetType="task"
            relType="related"
          />
        </View>

        <LinkedItemsSection entityType="idea" entityId={idea.id} />

        <Button
          label="Delete idea"
          variant="destructive"
          isLoading={deleteIdea.isPending}
          onPress={() => deleteIdea.mutate(idea.id, { onSuccess: () => router.back() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
