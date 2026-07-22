import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type RecipeRow = Tables<"recipes">;
export type RecipeInsert = TablesInsert<"recipes">;
export type RecipeUpdate = TablesUpdate<"recipes">;
