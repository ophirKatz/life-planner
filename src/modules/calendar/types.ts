import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type CalendarEventRow = Tables<"calendar_events">;
export type CalendarEventInsert = TablesInsert<"calendar_events">;
export type CalendarEventUpdate = TablesUpdate<"calendar_events">;

export type RepeatOption = "none" | "daily" | "weekly" | "monthly" | "yearly";

export const REPEAT_TO_RRULE: Record<Exclude<RepeatOption, "none">, string> = {
  daily: "FREQ=DAILY",
  weekly: "FREQ=WEEKLY",
  monthly: "FREQ=MONTHLY",
  yearly: "FREQ=YEARLY",
};

export function rruleToRepeatOption(rrule: string | null): RepeatOption {
  if (!rrule) return "none";
  const entry = Object.entries(REPEAT_TO_RRULE).find(([, value]) => value === rrule);
  return (entry?.[0] as RepeatOption) ?? "none";
}
