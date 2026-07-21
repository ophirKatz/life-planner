import { Sparkles } from "lucide-react-native";
import { View } from "react-native";

import { EmptyState } from "@/core/ui/EmptyState";

// Unreachable via the tab bar (the "add" tab's press is intercepted to open
// QuickAddSheet instead — see app/(tabs)/_layout.tsx). Kept only because
// Expo Router's Tabs needs a route file behind every registered tab.
export default function AddPlaceholderScreen() {
  return (
    <View className="flex-1 bg-bg">
      <EmptyState icon={Sparkles} title="Use the + tab to quick-add" />
    </View>
  );
}
