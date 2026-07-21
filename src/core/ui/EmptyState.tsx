import type { LucideIcon } from "lucide-react-native";
import { MotiView } from "moti";
import { Text, View } from "react-native";

import { Button } from "@/core/ui/Button";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center px-8 gap-3">
      <MotiView
        from={{ opacity: 0, scale: 0.9, translateY: 6 }}
        animate={{ opacity: 1, scale: 1, translateY: 0 }}
        transition={{ type: "spring", damping: 14, mass: 0.6 }}
        className="items-center gap-3"
      >
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-surface-muted mb-1 self-center">
          <Icon size={26} color={colors.mutedForeground} />
        </View>
        <Text className="text-lg font-semibold text-foreground text-center">{title}</Text>
        {description ? (
          <Text className="text-base text-muted-foreground text-center">{description}</Text>
        ) : null}
        {actionLabel && onAction ? (
          <Button label={actionLabel} onPress={onAction} className="mt-2" />
        ) : null}
      </MotiView>
    </View>
  );
}
