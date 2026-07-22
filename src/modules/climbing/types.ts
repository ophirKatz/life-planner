import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type ClimbingSessionRow = Tables<"climbing_sessions">;
export type ClimbingSessionInsert = TablesInsert<"climbing_sessions">;
export type ClimbingSessionUpdate = TablesUpdate<"climbing_sessions">;

export type ClimbingAttemptRow = Tables<"climbing_attempts">;
export type ClimbingAttemptInsert = TablesInsert<"climbing_attempts">;

export type ClimbingStyle = "boulder" | "route";
