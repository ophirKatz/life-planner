import { FlashList } from "@shopify/flash-list";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Plus, Trash2, Wallet } from "lucide-react-native";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useBudgetCategories } from "@/modules/budget/data/useBudgetCategories";
import { useDeleteTransaction, useTransactions } from "@/modules/budget/data/useTransactions";
import type { TransactionRow } from "@/modules/budget/types";
import { Button } from "@/core/ui/Button";
import { Card } from "@/core/ui/Card";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListRow } from "@/core/ui/ListRow";
import { SkeletonListItem } from "@/core/ui/Skeleton";

function TransactionRowItem({ transaction, categoryName }: { transaction: TransactionRow; categoryName?: string }) {
  const deleteTransaction = useDeleteTransaction();
  const isExpense = transaction.type === "expense";

  return (
    <ListRow
      title={transaction.note || categoryName || (isExpense ? "Expense" : "Income")}
      subtitle={`${format(new Date(transaction.occurred_at), "MMM d")}${categoryName ? ` · ${categoryName}` : ""}`}
      trailing={
        <Text className={`text-base font-medium ${isExpense ? "text-danger" : "text-accent"}`}>
          {isExpense ? "-" : "+"}${transaction.amount.toFixed(2)}
        </Text>
      }
      swipeAction={{
        label: "Delete",
        icon: Trash2,
        colorClassName: "bg-danger",
        onTrigger: () => deleteTransaction.mutate(transaction.id),
      }}
    />
  );
}

export function TransactionsListScreen() {
  const router = useRouter();
  const { data: transactions, isLoading, isError, refetch } = useTransactions();
  const { data: categories } = useBudgetCategories();

  const categoryName = (id: string | null) => categories?.find((c) => c.id === id)?.name;

  const spent = (transactions ?? []).filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  const income = (transactions ?? []).filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0);

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Text className="text-2xl font-semibold text-foreground">Budget</Text>
        <Button size="icon" variant="secondary" onPress={() => router.push("/modules/budget/new")}>
          <Plus size={20} />
        </Button>
      </View>

      <View className="px-6 pb-3">
        <Card className="flex-row justify-between">
          <View>
            <Text className="text-xs text-muted-foreground">Spent this month</Text>
            <Text className="text-lg font-semibold text-danger">${spent.toFixed(2)}</Text>
          </View>
          <View>
            <Text className="text-xs text-muted-foreground">Income this month</Text>
            <Text className="text-lg font-semibold text-accent">${income.toFixed(2)}</Text>
          </View>
        </Card>
      </View>

      {isLoading ? (
        <View className="px-6 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonListItem key={i} />
          ))}
        </View>
      ) : isError ? (
        <EmptyState icon={Wallet} title="Couldn&apos;t load transactions" actionLabel="Retry" onAction={() => refetch()} />
      ) : !transactions || transactions.length === 0 ? (
        <EmptyState
          icon={Wallet}
          title="No transactions this month"
          description="Log an expense or income to get started."
          actionLabel="New transaction"
          onAction={() => router.push("/modules/budget/new")}
        />
      ) : (
        <FlashList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TransactionRowItem transaction={item} categoryName={categoryName(item.category_id)} />
          )}
        />
      )}
    </SafeAreaView>
  );
}
