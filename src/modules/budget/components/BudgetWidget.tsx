import { useRouter } from "expo-router";
import { Wallet } from "lucide-react-native";
import { Text, View } from "react-native";

import { useTransactions } from "@/modules/budget/data/useTransactions";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function BudgetWidget() {
  const router = useRouter();
  const { data: transactions, isLoading } = useTransactions();
  const colors = useThemeColors();

  const spent = (transactions ?? [])
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <PressableCard onPress={() => router.push("/modules/budget")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Wallet size={18} color={colors.accent} />
        <CardTitle>Budget</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : (
        <Text className="text-sm text-foreground">${spent.toFixed(2)} spent this month</Text>
      )}
    </PressableCard>
  );
}
