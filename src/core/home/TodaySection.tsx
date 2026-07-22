import { differenceInMinutes, endOfDay, format, isPast, isToday, startOfDay } from "date-fns";
import { useRouter } from "expo-router";
import { AlertCircle, ChevronRight, Clock } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { useCalendarEvents } from "@/modules/calendar/data/useCalendarEvents";
import type { CalendarEventRow } from "@/modules/calendar/types";
import { HabitRow } from "@/modules/habits/components/HabitRow";
import { useHabits } from "@/modules/habits/data/useHabits";
import { useTasks, useToggleTaskDone } from "@/modules/tasks/data/useTasks";
import type { TaskRow } from "@/modules/tasks/types";
import { useIsModuleEnabled } from "@/core/modules/hooks";
import { Card } from "@/core/ui/Card";
import { Checkbox } from "@/core/ui/Checkbox";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

// How far ahead an upcoming event still counts as "next up" worth a banner.
const NEXT_UP_WINDOW_MINUTES = 180;
const TASKS_COLLAPSED_COUNT = 3;
const EVENTS_COLLAPSED_COUNT = 3;
const HABITS_COLLAPSED_COUNT = 4;
const priorityColor = ["transparent", "#facc15", "#fb923c", "#ef4444"];

function formatCountdown(minutes: number): string {
  if (minutes <= 0) return "now";
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

function SectionHeader({ title, viewAllHref }: { title: string; viewAllHref?: () => void }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center justify-between">
      <Text className="text-xs font-medium text-muted-foreground">{title}</Text>
      {viewAllHref ? (
        <Pressable className="flex-row items-center gap-0.5" onPress={viewAllHref} hitSlop={8}>
          <Text className="text-xs text-accent">View all</Text>
          <ChevronRight size={12} color={colors.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

// A due_at at exactly midnight means "due this day, no specific time" — see
// the same convention in TaskForm, which is the only place that sets it.
function taskHasTime(iso: string): boolean {
  return format(new Date(iso), "HH:mm") !== "00:00";
}

function TaskMiniRow({ task }: { task: TaskRow }) {
  const toggleDone = useToggleTaskDone();
  const colors = useThemeColors();
  const dueDate = task.due_at ? new Date(task.due_at) : null;
  const overdue = !!dueDate && !isToday(dueDate) && isPast(dueDate);
  const timed = !!task.due_at && taskHasTime(task.due_at);

  return (
    <View className="flex-row items-center gap-2.5">
      <Checkbox checked={false} onCheckedChange={() => toggleDone.mutate(task)} />
      {task.priority > 0 ? (
        <View className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: priorityColor[task.priority] }} />
      ) : null}
      <Text
        className={`text-sm flex-1 ${overdue ? "text-danger" : "text-foreground"}`}
        numberOfLines={1}
      >
        {task.title}
      </Text>
      {overdue ? <AlertCircle size={13} color={colors.danger} /> : null}
      {timed ? (
        <Text className={`text-xs shrink-0 ${overdue ? "text-danger font-medium" : "text-muted-foreground"}`}>
          {format(dueDate!, "p")}
        </Text>
      ) : null}
    </View>
  );
}

function EventMiniRow({ event }: { event: CalendarEventRow }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: event.color }} />
      <Text className="text-sm text-foreground flex-1" numberOfLines={1}>
        {event.title}
      </Text>
      <Text className="text-xs text-muted-foreground shrink-0">
        {event.all_day ? "All day" : format(new Date(event.starts_at), "p")}
      </Text>
    </View>
  );
}

/** Aggregates the "what's happening today" data from the tasks, habits and
 * calendar modules into one card, mirroring the personal-dashboard Today
 * section. Each subsection only shows if its module is enabled. */
export function TodaySection() {
  const router = useRouter();
  const [now, setNow] = useState(() => new Date());
  const [showAllTasks, setShowAllTasks] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const colors = useThemeColors();
  const { isEnabled: tasksEnabled } = useIsModuleEnabled("tasks");
  const { isEnabled: habitsEnabled } = useIsModuleEnabled("habits");
  const { isEnabled: calendarEnabled } = useIsModuleEnabled("calendar");

  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: habits, isLoading: habitsLoading } = useHabits();
  const { data: events, isLoading: eventsLoading } = useCalendarEvents(startOfDay(now), endOfDay(now));

  if (!tasksEnabled && !habitsEnabled && !calendarEnabled) return null;

  const dueTasks = (tasks ?? [])
    .filter((t) => t.status !== "done" && t.due_at)
    .filter((t) => {
      const due = new Date(t.due_at!);
      return isToday(due) || isPast(due);
    })
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())
    .sort((a, b) => {
      const aOverdue = !isToday(new Date(a.due_at!));
      const bOverdue = !isToday(new Date(b.due_at!));
      return Number(bOverdue) - Number(aOverdue);
    });

  const todaysEvents = events ?? [];

  const nextUp = [
    ...todaysEvents
      .filter((e) => !e.all_day)
      .map((e) => ({ label: e.title, minutes: differenceInMinutes(new Date(e.starts_at), now) })),
    ...dueTasks
      .filter((t) => taskHasTime(t.due_at!))
      .map((t) => ({ label: t.title, minutes: differenceInMinutes(new Date(t.due_at!), now) })),
  ]
    .filter((c) => c.minutes >= 0 && c.minutes <= NEXT_UP_WINDOW_MINUTES)
    .sort((a, b) => a.minutes - b.minutes)[0];

  const urgency = !nextUp ? null : nextUp.minutes <= 15 ? "high" : nextUp.minutes <= 60 ? "medium" : "low";
  const urgencyColor = urgency === "high" ? colors.danger : urgency === "medium" ? "#d97706" : colors.accent;

  return (
    <Card className="gap-4">
      <Text className="text-base font-semibold text-foreground">Today</Text>

      {nextUp ? (
        <View
          className="flex-row items-center gap-3 rounded-xl p-3 border"
          style={{ backgroundColor: `${urgencyColor}1a`, borderColor: `${urgencyColor}4d` }}
        >
          <Clock size={16} color={urgencyColor} />
          <View className="flex-1">
            <Text className="text-xs text-muted-foreground">Next up</Text>
            <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
              {nextUp.label}
            </Text>
          </View>
          <Text className="text-sm font-semibold text-foreground shrink-0">
            in {formatCountdown(nextUp.minutes)}
          </Text>
        </View>
      ) : null}

      {calendarEnabled ? (
        <View className="gap-2">
          <SectionHeader title="Events" viewAllHref={() => router.push("/(tabs)/calendar")} />
          {eventsLoading ? (
            <Skeleton className="h-4 w-2/3" />
          ) : todaysEvents.length === 0 ? (
            <Text className="text-sm text-muted-foreground">No events today</Text>
          ) : (
            <View className="gap-1.5">
              {todaysEvents.slice(0, EVENTS_COLLAPSED_COUNT).map((event) => (
                <EventMiniRow key={event.id} event={event} />
              ))}
              {todaysEvents.length > EVENTS_COLLAPSED_COUNT ? (
                <Text className="text-xs text-muted-foreground">
                  +{todaysEvents.length - EVENTS_COLLAPSED_COUNT} more
                </Text>
              ) : null}
            </View>
          )}
        </View>
      ) : null}

      {tasksEnabled ? (
        <View className="gap-2 border-t border-border pt-3">
          <SectionHeader title="Tasks" viewAllHref={() => router.push("/modules/tasks")} />
          {tasksLoading ? (
            <Skeleton className="h-4 w-1/2" />
          ) : dueTasks.length === 0 ? (
            <Text className="text-sm text-muted-foreground">Nothing due today</Text>
          ) : (
            <View className="gap-1.5">
              {(showAllTasks ? dueTasks : dueTasks.slice(0, TASKS_COLLAPSED_COUNT)).map((task) => (
                <TaskMiniRow key={task.id} task={task} />
              ))}
              {dueTasks.length > TASKS_COLLAPSED_COUNT ? (
                <Pressable onPress={() => setShowAllTasks((v) => !v)} hitSlop={8}>
                  <Text className="text-xs text-muted-foreground">
                    {showAllTasks ? "Show less" : `+${dueTasks.length - TASKS_COLLAPSED_COUNT} more`}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          )}
        </View>
      ) : null}

      {habitsEnabled && !habitsLoading && habits && habits.length > 0 ? (
        <View className="gap-2 border-t border-border pt-3">
          <SectionHeader title="Habits" viewAllHref={() => router.push("/modules/habits")} />
          <View className="gap-2">
            {habits.slice(0, HABITS_COLLAPSED_COUNT).map((habit) => (
              <HabitRow key={habit.id} habit={habit} compact />
            ))}
          </View>
          {habits.length > HABITS_COLLAPSED_COUNT ? (
            <Text className="text-xs text-muted-foreground">+{habits.length - HABITS_COLLAPSED_COUNT} more</Text>
          ) : null}
        </View>
      ) : null}
    </Card>
  );
}
