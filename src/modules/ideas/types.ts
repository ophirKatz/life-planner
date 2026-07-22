import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type IdeaRow = Tables<"ideas">;
export type IdeaInsert = TablesInsert<"ideas">;
export type IdeaUpdate = TablesUpdate<"ideas">;

export type IdeaStatus = "new" | "exploring" | "archived" | "done";
