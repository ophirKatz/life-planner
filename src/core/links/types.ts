import type { Tables } from "@/core/db/types";

export type LinkRow = Tables<"links">;

export interface CreateLinkInput {
  fromType: string;
  fromId: string;
  toType: string;
  toId: string;
  relType: string;
  data?: Record<string, unknown>;
}

export interface ResolvedLinkTarget {
  id: string;
  title: string;
  subtitle?: string;
}
