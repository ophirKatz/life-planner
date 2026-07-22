import { useRouter } from "expo-router";
import { Text } from "react-native";

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
    <>
      <Text className="text-lg font-semibold text-foreground text-center mb-4">New idea</Text>
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
    </>
  );
}
