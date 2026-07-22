import { format } from "date-fns";
import { useRouter } from "expo-router";
import { LayoutDashboard, Plus } from "lucide-react-native";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSession } from "@/core/auth/session";
import { QuickAccessGrid } from "@/core/home/QuickAccessGrid";
import { TodaySection } from "@/core/home/TodaySection";
import { useIsModuleEnabled, useModuleWidgets } from "@/core/modules/hooks";
import { useUserModules } from "@/core/modules/data/useUserModules";
import { Button } from "@/core/ui/Button";
import { EmptyState } from "@/core/ui/EmptyState";
import { SkeletonListItem } from "@/core/ui/Skeleton";

// Modules with dedicated Home real estate (Today section, quick access) so
// their generic dashboardWidgets don't also render further down.
const CURATED_WIDGET_SLUGS = new Set(["tasks", "habits", "calendar", "shopping", "people"]);

function greeting(): string {
  const hour = new Date().getHours();
  return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
}

function greetingName(email: string | undefined): string {
  if (!email) return "there";
  return email.split("@")[0] ?? "there";
}

export default function HomeScreen() {
  const router = useRouter();
  const { isLoading } = useUserModules();
  const { session } = useSession();
  const { isEnabled: tasksEnabled } = useIsModuleEnabled("tasks");
  const widgets = useModuleWidgets();
  const extraWidgets = widgets.filter(({ slug }) => !CURATED_WIDGET_SLUGS.has(slug));

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
    <SafeAreaView edges={["top"]} className="flex-1 bg-bg">
      <ScrollView className="flex-1" contentContainerClassName="px-6 pt-4 pb-10 gap-4">
        <View className="flex-row items-start justify-between gap-3">
          <View>
            <Text className="text-2xl font-bold text-foreground">
              {greeting()}, {greetingName(session?.user.email)}
            </Text>
            <Text className="text-sm text-muted-foreground mt-0.5">{format(new Date(), "EEEE, MMMM d")}</Text>
          </View>
          {tasksEnabled ? (
            <Button
              size="icon"
              className="rounded-full shrink-0"
              accessibilityLabel="Add task"
              onPress={() => router.push("/modules/tasks/new")}
            >
              <Plus size={20} />
            </Button>
          ) : null}
        </View>

        <QuickAccessGrid />
        <TodaySection />

        {extraWidgets.map(({ key, Widget }) => (
          <Widget key={key} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
