import { useRouter } from "expo-router";
import { Users } from "lucide-react-native";
import { Text, View } from "react-native";

import { usePeople } from "@/modules/people/data/usePeople";
import { CardTitle, PressableCard } from "@/core/ui/Card";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export function PeopleWidget() {
  const router = useRouter();
  const { data: people, isLoading } = usePeople();
  const colors = useThemeColors();

  return (
    <PressableCard onPress={() => router.push("/modules/people")}>
      <View className="flex-row items-center gap-2 mb-3">
        <Users size={18} color={colors.accent} />
        <CardTitle>People</CardTitle>
      </View>

      {isLoading ? (
        <Skeleton className="h-4 w-2/3" />
      ) : !people || people.length === 0 ? (
        <Text className="text-sm text-muted-foreground">No contacts yet.</Text>
      ) : (
        <Text className="text-sm text-foreground">
          {people.length} contact{people.length === 1 ? "" : "s"}
        </Text>
      )}
    </PressableCard>
  );
}
