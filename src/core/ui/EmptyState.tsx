import type { LucideIcon } from "lucide-react-native";
import { Text, View } from "react-native";

import { Button } from "@/core/ui/Button";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3">
      <View className="h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted mb-1">
        <Icon size={26} color="hsl(220 9% 46%)" />
      </View>
      <Text className="text-lg font-semibold text-foreground text-center">{title}</Text>
      {description ? (
        <Text className="text-base text-muted-foreground text-center">{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <Button label={actionLabel} onPress={onAction} className="mt-2" />
      ) : null}
    </View>
  );
}
