import { LayoutDashboard } from "lucide-react-native";
import { View } from "react-native";
import { useRouter } from "expo-router";

import { EmptyState } from "@/core/ui/EmptyState";

// Real dashboard widget composition arrives in M4. For now this is the
// "empty Home" M0/M2 require: authed users land here with nothing to show yet.
export default function HomeScreen() {
  const router = useRouter();

  return (
    <View className="flex-1 bg-bg">
      <EmptyState
        icon={LayoutDashboard}
        title="Your dashboard is empty"
        description="Enable modules from the Store to see them here."
        actionLabel="Browse the Store"
        onAction={() => router.push("/store")}
      />
    </View>
  );
}
