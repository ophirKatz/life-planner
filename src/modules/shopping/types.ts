import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type ShoppingListRow = Tables<"shopping_lists">;
export type ShoppingListInsert = TablesInsert<"shopping_lists">;

export type ShoppingItemRow = Tables<"shopping_items">;
export type ShoppingItemInsert = TablesInsert<"shopping_items">;
export type ShoppingItemUpdate = TablesUpdate<"shopping_items">;
