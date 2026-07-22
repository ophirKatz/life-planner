import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type WishlistItemRow = Tables<"wishlist_items">;
export type WishlistItemInsert = TablesInsert<"wishlist_items">;
export type WishlistItemUpdate = TablesUpdate<"wishlist_items">;

export type WishlistItemType = "movie" | "tv" | "book" | "game" | "other";
export type WishlistItemStatus = "want" | "in_progress" | "done";
