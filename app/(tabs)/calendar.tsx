import { CalendarDays } from "lucide-react-native";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { useIsModuleEnabled } from "@/core/modules/hooks";
import { CalendarHomeScreen } from "@/modules/calendar/screens/CalendarHomeScreen";
import { EmptyState } from "@/core/ui/EmptyState";
import { Skeleton } from "@/core/ui/Skeleton";

export default function CalendarTabScreen() {
  const router = useRouter();
  const { isEnabled, isLoading } = useIsModuleEnabled("calendar");

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg px-6 pt-16 gap-3">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </View>
    );
  }

  if (!isEnabled) {
    return (
      <View className="flex-1 bg-bg">
        <EmptyState
          icon={CalendarDays}
          title="Calendar isn't enabled"
          description="Enable the Calendar module from the Store to get started."
          actionLabel="Browse the Store"
          onAction={() => router.push("/store")}
        />
      </View>
    );
  }

  return <CalendarHomeScreen />;
}
