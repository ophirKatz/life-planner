import { format, subDays } from "date-fns";

const DAY_FORMAT = "yyyy-MM-dd";

export function todayKey(): string {
  return format(new Date(), DAY_FORMAT);
}

/**
 * Consecutive-day streak ending today, with a one-day grace period: if today
 * isn't logged yet the streak still counts through yesterday (the day isn't
 * "missed" until it's fully over). Used for daily, weekly, and custom cadence
 * alike as a v1 simplification — DESIGN.md only requires streaks be computed,
 * not stored, and doesn't mandate a per-period algorithm.
 */
export function computeStreak(logDates: string[]): number {
  const dates = new Set(logDates);
  let cursor = new Date();
  if (!dates.has(format(cursor, DAY_FORMAT))) {
    cursor = subDays(cursor, 1);
  }

  let streak = 0;
  while (dates.has(format(cursor, DAY_FORMAT))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}
