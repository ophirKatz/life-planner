import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { cn } from "@/core/ui/lib/utils";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export interface MiniMonthCalendarProps {
  month: Date;
  onMonthChange: (month: Date) => void;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  /** "yyyy-MM-dd" keys for days that have at least one event. */
  markedDates?: Set<string>;
}

export function MiniMonthCalendar({
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
  markedDates,
}: MiniMonthCalendarProps) {
  const gridStart = startOfWeek(startOfMonth(month));
  const gridEnd = endOfWeek(endOfMonth(month));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const colors = useThemeColors();

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between px-1">
        <Pressable
          onPress={() => onMonthChange(subMonths(month, 1))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Previous month"
        >
          <ChevronLeft size={20} color={colors.mutedForeground} />
        </Pressable>
        <Text className="text-base font-semibold text-foreground">{format(month, "MMMM yyyy")}</Text>
        <Pressable
          onPress={() => onMonthChange(addMonths(month, 1))}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Next month"
        >
          <ChevronRight size={20} color={colors.mutedForeground} />
        </Pressable>
      </View>

      <View className="flex-row">
        {WEEKDAY_LABELS.map((label, i) => (
          <View key={i} className="flex-1 items-center">
            <Text className="text-xs font-medium text-muted-foreground">{label}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {days.map((day) => {
          const inMonth = isSameMonth(day, month);
          const selected = isSameDay(day, selectedDate);
          const marked = markedDates?.has(format(day, "yyyy-MM-dd"));

          return (
            <View key={day.toISOString()} style={{ width: `${100 / 7}%` }} className="items-center py-1">
              <Pressable
                onPress={() => onSelectDate(day)}
                className={cn(
                  "h-9 w-9 items-center justify-center rounded-full",
                  selected && "bg-accent",
                  !selected && isToday(day) && "border border-accent"
                )}
              >
                <Text
                  className={cn(
                    "text-sm tabular-nums",
                    selected ? "text-accent-foreground font-semibold" : inMonth ? "text-foreground" : "text-muted-foreground/50"
                  )}
                >
                  {format(day, "d")}
                </Text>
              </Pressable>
              <View className={cn("h-1 w-1 rounded-full mt-0.5", marked ? "bg-accent" : "bg-transparent")} />
            </View>
          );
        })}
      </View>
    </View>
  );
}
