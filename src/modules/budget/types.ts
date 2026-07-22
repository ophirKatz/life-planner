import type { Tables, TablesInsert, TablesUpdate } from "@/core/db/types";

export type BudgetCategoryRow = Tables<"budget_categories">;
export type BudgetCategoryInsert = TablesInsert<"budget_categories">;

export type TransactionRow = Tables<"transactions">;
export type TransactionInsert = TablesInsert<"transactions">;
export type TransactionUpdate = TablesUpdate<"transactions">;

export type TransactionType = "income" | "expense";
