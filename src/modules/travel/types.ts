import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type TripRow = Tables<"trips">;
export type TripInsert = TablesInsert<"trips">;
export type TripUpdate = TablesUpdate<"trips">;

export type TripItemRow = Tables<"trip_items">;
export type TripItemInsert = TablesInsert<"trip_items">;

export type TripItemType = "itinerary" | "packing" | "document" | "note";
