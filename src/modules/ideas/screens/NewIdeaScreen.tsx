import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IdeaForm } from "@/modules/ideas/components/IdeaForm";
import { useCreateIdea } from "@/modules/ideas/data/useIdeas";

function parseTags(input?: string): string[] {
  return (input ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function NewIdeaScreen() {
  const router = useRouter();
  const createIdea = useCreateIdea();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">New idea</Text>
        <IdeaForm
          submitLabel="Save idea"
          isSubmitting={createIdea.isPending}
          defaultValues={{ title: "", description: "", tags: "", status: "new" }}
          onSubmit={(values) => {
            createIdea.mutate(
              {
                title: values.title,
                description: values.description || null,
                tags: parseTags(values.tags),
                status: values.status,
              },
              { onSuccess: () => router.back() }
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
