import { useRouter } from "expo-router";
import type { LucideIcon } from "lucide-react-native";
import { ShoppingCart, Users } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useIsModuleEnabled } from "@/core/modules/hooks";
import { peopleModule } from "@/modules/people/definition";
import { shoppingModule } from "@/modules/shopping/definition";

interface QuickAccessTile {
  slug: string;
  label: string;
  hint: string;
  icon: LucideIcon;
  color: string;
  onPress: () => void;
  onLongPress: () => void;
}

function Tile({ tile }: { tile: QuickAccessTile }) {
  const Icon = tile.icon;
  return (
    <Pressable
      onPress={tile.onPress}
      onLongPress={tile.onLongPress}
      accessibilityRole="button"
      accessibilityLabel={tile.label}
      accessibilityHint={tile.hint}
      className="flex-1 items-center gap-1.5 rounded-2xl bg-surface border border-border p-3.5 active:opacity-70"
    >
      <View
        className="h-9 w-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${tile.color}22` }}
      >
        <Icon size={16} color={tile.color} />
      </View>
      <Text className="text-xs font-medium text-muted-foreground">{tile.label}</Text>
    </Pressable>
  );
}

/** One-tap links to modules that aren't otherwise summarized by TodaySection,
 * with a long-press shortcut into each module's own quick-add action. */
export function QuickAccessGrid() {
  const router = useRouter();
  const { isEnabled: shoppingEnabled } = useIsModuleEnabled("shopping");
  const { isEnabled: peopleEnabled } = useIsModuleEnabled("people");

  const tiles: QuickAccessTile[] = [];
  if (shoppingEnabled) {
    tiles.push({
      slug: "shopping",
      label: "Shopping",
      hint: "Long press to add an item",
      icon: ShoppingCart,
      color: "#10b981",
      onPress: () => router.push("/modules/shopping"),
      onLongPress: () => shoppingModule.quickAddActions[0]?.onPress(),
    });
  }
  if (peopleEnabled) {
    tiles.push({
      slug: "people",
      label: "People",
      hint: "Long press to add a contact",
      icon: Users,
      color: "#8b5cf6",
      onPress: () => router.push("/modules/people"),
      onLongPress: () => peopleModule.quickAddActions[0]?.onPress(),
    });
  }

  if (tiles.length === 0) return null;

  return (
    <View className="flex-row gap-3">
      {tiles.map((tile) => (
        <Tile key={tile.slug} tile={tile} />
      ))}
    </View>
  );
}
