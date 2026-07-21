import { CalendarDays } from "lucide-react-native";
import { useRouter } from "expo-router";
import { View } from "react-native";

import { EmptyState } from "@/core/ui/EmptyState";

// Replaced by the Calendar module's screens in M3/M4.
export default function CalendarPlaceholderScreen() {
  const router = useRouter();

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
