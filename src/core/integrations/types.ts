import type { Tables } from "@/core/db/types";

// The client only ever reads the token-free view — never the raw table.
export type ConnectedAccountRow = Tables<"connected_accounts_safe">;
