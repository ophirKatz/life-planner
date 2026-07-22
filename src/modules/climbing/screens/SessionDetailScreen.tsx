import { format } from "date-fns";
import { useRouter } from "expo-router";
import { AlertTriangle } from "lucide-react-native";
import { ActivityIndicator, ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AttemptsSection } from "@/modules/climbing/components/AttemptsSection";
import { useDeleteClimbingSession, useClimbingSession } from "@/modules/climbing/data/useClimbingSessions";
import { Button } from "@/core/ui/Button";
import { Card } from "@/core/ui/Card";
import { EmptyState } from "@/core/ui/EmptyState";

export function SessionDetailScreen({ id }: { id: string }) {
  const router = useRouter();
  const { data: session, isLoading, isError } = useClimbingSession(id);
  const deleteSession = useDeleteClimbingSession();

  if (isLoading) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg items-center justify-center">
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (isError || !session) {
    return (
      <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
        <EmptyState icon={AlertTriangle} title="Session not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView contentContainerClassName="px-6 pt-4 pb-10 gap-6">
        <Card className="gap-1">
          <Text className="text-lg font-semibold text-foreground">
            {format(new Date(session.session_date), "EEEE, MMMM d")}
          </Text>
          {session.location ? <Text className="text-sm text-muted-foreground">{session.location}</Text> : null}
          {session.duration_minutes ? (
            <Text className="text-sm text-muted-foreground">{session.duration_minutes} min</Text>
          ) : null}
          {session.notes ? <Text className="text-sm text-foreground mt-2">{session.notes}</Text> : null}
        </Card>

        <AttemptsSection sessionId={session.id} />

        <Button
          label="Delete session"
          variant="destructive"
          isLoading={deleteSession.isPending}
          onPress={() => deleteSession.mutate(session.id, { onSuccess: () => router.back() })}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
