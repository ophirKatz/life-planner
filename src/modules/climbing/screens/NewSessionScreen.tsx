import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { SessionForm } from "@/modules/climbing/components/SessionForm";
import { useCreateClimbingSession } from "@/modules/climbing/data/useClimbingSessions";

export function NewSessionScreen() {
  const router = useRouter();
  const createSession = useCreateClimbingSession();

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">Log a session</Text>
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
      </View>
    </SafeAreaView>
  );
}
