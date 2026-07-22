import type { LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { Checkbox } from "@/core/ui/Checkbox";
import { cn } from "@/core/ui/lib/utils";
import { SwipeableRow } from "@/core/ui/SwipeableRow";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export type ListRowLeading =
  | { type: "checkbox"; checked: boolean; onToggle: () => void; disabled?: boolean; accessibilityLabel?: string }
  | { type: "dot"; color: string }
  | { type: "icon"; icon: LucideIcon };

export interface ListRowSwipeAction {
  label: string;
  icon: LucideIcon;
  /** Defaults to SwipeableRow's own default (success/green) — pass
   * "bg-danger" for a destructive action like delete. */
  colorClassName?: string;
  onTrigger: () => void;
}

export interface ListRowProps {
  leading?: ListRowLeading;
  /** A second small leading indicator after the primary one — e.g. a
   * priority dot next to a task's checkbox. */
  leadingExtra?: React.ReactNode;
  title: string;
  /** Strikes through and mutes the title — a completed task, a checked-off item. */
  titleDone?: boolean;
  titleClassName?: string;
  subtitle?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  /** Full right-swipe triggers this — not necessarily destructive (e.g.
   * "mark done"), see colorClassName. */
  swipeAction?: ListRowSwipeAction;
  className?: string;
}

/** The row shape repeated across every list in the app: an optional leading
 * checkbox/dot/icon, a title (+ subtitle), trailing metadata, and an
 * optional swipe-to-delete. One implementation instead of a bespoke
 * `TaskRowItem`/`IdeaRowItem`/`TransactionRowItem`/... per module. */
export function ListRow({
  leading,
  leadingExtra,
  title,
  titleDone,
  titleClassName,
  subtitle,
  trailing,
  onPress,
  swipeAction,
  className,
}: ListRowProps) {
  const colors = useThemeColors();

  let leadingNode: React.ReactNode = null;
  if (leading?.type === "checkbox") {
    leadingNode = (
      <Checkbox
        checked={leading.checked}
        onCheckedChange={leading.onToggle}
        disabled={leading.disabled}
        accessibilityLabel={leading.accessibilityLabel}
      />
    );
  } else if (leading?.type === "dot") {
    leadingNode = <View className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: leading.color }} />;
  } else if (leading?.type === "icon") {
    const Icon = leading.icon;
    leadingNode = <Icon size={18} color={colors.mutedForeground} />;
  }

  const row = (
    <Pressable
      className={cn("flex-row items-center gap-3 bg-bg px-6 py-3.5", onPress && "active:opacity-70", className)}
      onPress={onPress}
      disabled={!onPress}
    >
      {leadingNode}
      {leadingExtra}
      <View className="flex-1">
        <Text
          className={cn(
            "text-base",
            titleDone ? "text-muted-foreground line-through" : "text-foreground",
            titleClassName
          )}
          numberOfLines={1}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text className="text-xs text-muted-foreground" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {trailing}
    </Pressable>
  );

  if (!swipeAction) return row;

  return (
    <SwipeableRow
      actionLabel={swipeAction.label}
      actionIcon={swipeAction.icon}
      actionColorClassName={swipeAction.colorClassName}
      onTrigger={swipeAction.onTrigger}
    >
      {row}
    </SwipeableRow>
  );
}
