import { useRouter } from "expo-router";
import { LayoutDashboard } from "lucide-react-native";
import { ScrollView, View } from "react-native";

import { useModuleWidgets } from "@/core/modules/hooks";
import { useUserModules } from "@/core/modules/data/useUserModules";
import { EmptyState } from "@/core/ui/EmptyState";
import { SkeletonListItem } from "@/core/ui/Skeleton";

// Basic show/hide by enabled module (M3). User-ordered composition and
// cross-module widgets land in M4.
export default function HomeScreen() {
  const router = useRouter();
  const { isLoading } = useUserModules();
  const widgets = useModuleWidgets();

  if (isLoading) {
    return (
      <View className="flex-1 bg-bg px-6 pt-16 gap-3">
        <SkeletonListItem />
        <SkeletonListItem />
      </View>
    );
  }

  if (widgets.length === 0) {
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

  return (
    <ScrollView className="flex-1 bg-bg" contentContainerClassName="px-6 pt-16 pb-10 gap-3">
      {widgets.map(({ key, Widget }) => (
        <Widget key={key} />
      ))}
    </ScrollView>
  );
}
