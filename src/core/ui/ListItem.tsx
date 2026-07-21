import type { LucideIcon } from "lucide-react-native";
import { ChevronRight } from "lucide-react-native";
import { Pressable, Text, View, type PressableProps } from "react-native";

import { cn } from "@/core/ui/lib/utils";

export interface ListItemProps extends PressableProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  className?: string;
}

export function ListItem({
  title,
  subtitle,
  icon: Icon,
  trailing,
  showChevron,
  className,
  ...props
}: ListItemProps) {
  return (
    <Pressable
      accessibilityRole={props.onPress ? "button" : undefined}
      className={cn(
        "flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-3.5 active:opacity-70",
        className
      )}
      {...props}
    >
      {Icon ? (
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-surface-muted">
          <Icon size={20} color="hsl(220 9% 46%)" />
        </View>
      ) : null}

      <View className="flex-1">
        <Text className="text-base font-medium text-foreground" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-sm text-muted-foreground" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing}
      {showChevron ? <ChevronRight size={18} color="hsl(220 9% 46%)" /> : null}
    </Pressable>
  );
}
