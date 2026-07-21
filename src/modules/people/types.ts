import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type PersonRow = Tables<"people">;
export type PersonInsert = TablesInsert<"people">;
export type PersonUpdate = TablesUpdate<"people">;
