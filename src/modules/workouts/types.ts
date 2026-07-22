import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type WorkoutRow = Tables<"workouts">;
export type WorkoutInsert = TablesInsert<"workouts">;
export type WorkoutUpdate = TablesUpdate<"workouts">;

export type WorkoutType = "strength" | "cardio" | "yoga" | "other";
