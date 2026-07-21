import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type HabitRow = Tables<"habits">;
export type HabitInsert = TablesInsert<"habits">;
export type HabitUpdate = TablesUpdate<"habits">;

export type HabitLogRow = Tables<"habit_logs">;

export type HabitCadence = "daily" | "weekly" | "custom";
