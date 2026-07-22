import { formatISO, startOfDay } from "date-fns";
import { useRouter } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { TransactionForm } from "@/modules/budget/components/TransactionForm";
import { useCreateTransaction } from "@/modules/budget/data/useTransactions";

export function NewTransactionScreen() {
  const router = useRouter();
  const createTransaction = useCreateTransaction();
  const today = formatISO(startOfDay(new Date()), { representation: "date" });

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <View className="px-6 pt-4 pb-6">
        <Text className="text-2xl font-semibold text-foreground mb-6">New transaction</Text>
        <TransactionForm
          submitLabel="Save transaction"
          isSubmitting={createTransaction.isPending}
          defaultValues={{ amount: 0, type: "expense", category_id: null, occurred_at: today, note: "" }}
          onSubmit={(values) => {
            createTransaction.mutate(
              {
                amount: values.amount,
                type: values.type,
                category_id: values.category_id,
                occurred_at: values.occurred_at,
                note: values.note || null,
              },
              { onSuccess: () => router.back() }
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}
