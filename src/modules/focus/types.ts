import type { Tables } from "@/core/db/types";

export type FocusSummaryRow = Tables<"focus_summaries">;
export type FocusPeriod = "tomorrow" | "week";

export type FocusCardItem = { type: "task" | "event"; id: string; title: string };
export type FocusCard = { label: string; insight: string; items: FocusCardItem[] };
export type FocusSummaryPayload =
  | { type: "cards"; cards: FocusCard[]; note: string | null }
  | { type: "text"; text: string };
