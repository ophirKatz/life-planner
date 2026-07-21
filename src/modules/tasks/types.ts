import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type TaskRow = Tables<"tasks">;
export type TaskInsert = TablesInsert<"tasks">;
export type TaskUpdate = TablesUpdate<"tasks">;

export type TaskListRow = Tables<"task_lists">;
export type TaskListInsert = TablesInsert<"task_lists">;

export type TaskStatus = "todo" | "doing" | "done";
