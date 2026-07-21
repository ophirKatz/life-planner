import { Tabs } from "expo-router";
import { Calendar, Home, PlusCircle, Store, User } from "lucide-react-native";
import { useColorScheme } from "nativewind";

import { QuickAddSheet } from "@/core/ui/QuickAddSheet";
import { getThemeColors } from "@/core/ui/theme/colors";
import { useQuickAddStore } from "@/core/ui/quick-add-store";

export default function TabsLayout() {
  const { colorScheme } = useColorScheme();
  const colors = getThemeColors(colorScheme ?? "light");
  const openQuickAdd = useQuickAddStore((s) => s.open);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "Home", tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: "Calendar",
            tabBarIcon: ({ color, size }) => <Calendar color={color} size={size} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
            tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              openQuickAdd();
            },
          }}
        />
        <Tabs.Screen
          name="store"
          options={{ title: "Store", tabBarIcon: ({ color, size }) => <Store color={color} size={size} /> }}
        />
        <Tabs.Screen
          name="profile"
          options={{ title: "Profile", tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }}
        />
      </Tabs>
      <QuickAddSheet />
    </>
  );
}
