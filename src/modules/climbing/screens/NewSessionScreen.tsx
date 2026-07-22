import { useRouter } from "expo-router";
import { Text } from "react-native";

import { SessionForm } from "@/modules/climbing/components/SessionForm";
import { useCreateClimbingSession } from "@/modules/climbing/data/useClimbingSessions";

export function NewSessionScreen() {
  const router = useRouter();
  const createSession = useCreateClimbingSession();

  return (
    <>
      <Text className="text-lg font-semibold text-foreground text-center mb-4">Log a session</Text>
      <SessionForm
        submitLabel="Save session"
        isSubmitting={createSession.isPending}
        defaultValues={{ location: "", duration_minutes: undefined, notes: "" }}
        onSubmit={(values) => {
          createSession.mutate(
            {
              location: values.location || null,
              duration_minutes: values.duration_minutes ?? null,
              notes: values.notes || null,
            },
            { onSuccess: (session) => router.replace(`/modules/climbing/${session.id}`) }
          );
        }}
      />
    </>
  );
}
