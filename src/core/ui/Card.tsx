import { Pressable, Text, View, type PressableProps, type ViewProps } from "react-native";

import { cn } from "@/core/ui/lib/utils";

const cardClassName = "rounded-2xl bg-surface border border-border p-4 shadow-sm";

export function Card({ className, ...props }: ViewProps) {
  return <View className={cn(cardClassName, className)} {...props} />;
}

/** Same look as Card, but a real Pressable — for tappable dashboard widgets. */
export function PressableCard({ className, ...props }: PressableProps) {
  return (
    <Pressable className={cn(cardClassName, "active:opacity-70", className)} {...props} />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />;
}
