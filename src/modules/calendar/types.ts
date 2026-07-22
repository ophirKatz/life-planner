import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";
import type { FrequencyUnit, FrequencyValue } from "@/core/ui/FrequencyInput";

export type CalendarEventRow = Tables<"calendar_events">;
export type CalendarEventInsert = TablesInsert<"calendar_events">;
export type CalendarEventUpdate = TablesUpdate<"calendar_events">;

const UNIT_TO_FREQ: Record<FrequencyUnit, string> = { day: "DAILY", week: "WEEKLY", month: "MONTHLY", year: "YEARLY" };
const FREQ_TO_UNIT: Record<string, FrequencyUnit> = { DAILY: "day", WEEKLY: "week", MONTHLY: "month", YEARLY: "year" };

/** `null` means "doesn't repeat" (no rrule stored). Interval 1 stores the
 * plain `FREQ=...` form for backwards compatibility with rows written
 * before custom intervals existed; anything else adds `;INTERVAL=N`. */
export function frequencyToRRule(value: FrequencyValue | null): string | null {
  if (!value) return null;
  const freq = UNIT_TO_FREQ[value.unit];
  return value.interval > 1 ? `FREQ=${freq};INTERVAL=${value.interval}` : `FREQ=${freq}`;
}

export function rruleToFrequency(rrule: string | null): FrequencyValue | null {
  if (!rrule) return null;
  const parts: Record<string, string> = {};
  for (const part of rrule.split(";")) {
    const [key, value] = part.split("=");
    if (key && value) parts[key] = value;
  }
  const unit = FREQ_TO_UNIT[parts.FREQ ?? ""];
  if (!unit) return null;
  return { interval: parts.INTERVAL ? Number(parts.INTERVAL) : 1, unit };
}
