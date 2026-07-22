import { CheckCircle2, Circle, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import {
  useClimbingAttempts,
  useDeleteClimbingAttempt,
  useLogClimbingAttempt,
} from "@/modules/climbing/data/useClimbingAttempts";
import type { ClimbingStyle } from "@/modules/climbing/types";
import { Button } from "@/core/ui/Button";
import { Input } from "@/core/ui/Input";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

const STYLES: { value: ClimbingStyle; label: string }[] = [
  { value: "boulder", label: "Boulder" },
  { value: "route", label: "Route" },
];

export function AttemptsSection({ sessionId }: { sessionId: string }) {
  const { data: attempts, isLoading } = useClimbingAttempts(sessionId);
  const logAttempt = useLogClimbingAttempt(sessionId);
  const deleteAttempt = useDeleteClimbingAttempt(sessionId);
  const colors = useThemeColors();

  const [grade, setGrade] = useState("");
  const [style, setStyle] = useState<ClimbingStyle>("boulder");
  const [sent, setSent] = useState(true);

  const submit = () => {
    const trimmed = grade.trim();
    if (!trimmed) return;
    logAttempt.mutate(
      { grade: trimmed, style, sent, attempts_count: 1 },
      { onSuccess: () => setGrade("") }
    );
  };

  return (
    <View className="gap-3">
      <Text className="text-sm font-medium text-muted-foreground">Attempts</Text>

      <View className="gap-2">
        <View className="flex-row items-center gap-2">
          <Input
            containerClassName="flex-1"
            value={grade}
            onChangeText={setGrade}
            placeholder="Grade, e.g. V4 or 5.10a"
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <Button label="Log" size="sm" onPress={submit} isLoading={logAttempt.isPending} disabled={!grade.trim()} />
        </View>
        <View className="flex-row gap-2">
          {STYLES.map((option) => (
            <Button
              key={option.value}
              label={option.label}
              size="sm"
              variant={style === option.value ? "default" : "secondary"}
              onPress={() => setStyle(option.value)}
            />
          ))}
          <Button
            label={sent ? "Sent" : "Attempted"}
            size="sm"
            variant={sent ? "default" : "secondary"}
            onPress={() => setSent((v) => !v)}
          />
        </View>
      </View>

      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : !attempts || attempts.length === 0 ? (
        <Text className="text-sm text-muted-foreground">No attempts logged yet.</Text>
      ) : (
        <View className="gap-2">
          {attempts.map((attempt) => (
            <View
              key={attempt.id}
              className="flex-row items-center gap-2.5 rounded-xl bg-surface border border-border p-3"
            >
              {attempt.sent ? (
                <CheckCircle2 size={16} color={colors.accent} />
              ) : (
                <Circle size={16} color={colors.mutedForeground} />
              )}
              <Text className="text-sm text-foreground flex-1">
                {attempt.grade} · {attempt.style === "boulder" ? "Boulder" : "Route"}
              </Text>
              <Pressable hitSlop={8} onPress={() => deleteAttempt.mutate(attempt.id)}>
                <Trash2 size={16} color={colors.mutedForeground} />
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
