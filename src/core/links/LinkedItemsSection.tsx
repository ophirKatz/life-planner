import { Link2 } from "lucide-react-native";
import { Text, View } from "react-native";

import { useLinksForEntity } from "@/core/links/data/useLinksForEntity";
import { Skeleton } from "@/core/ui/Skeleton";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export interface LinkedItemsSectionProps {
  entityType: string;
  entityId: string;
}

/** Read-only "linked items" list for a detail screen. Creating links (and the
 * reciprocal view from the other side) is wired up per-module starting M4. */
export function LinkedItemsSection({ entityType, entityId }: LinkedItemsSectionProps) {
  const { data: links, isLoading } = useLinksForEntity(entityType, entityId);
  const colors = useThemeColors();

  return (
    <View className="gap-2">
      <View className="flex-row items-center gap-2">
        <Link2 size={16} color={colors.mutedForeground} />
        <Text className="text-sm font-medium text-muted-foreground">Linked items</Text>
      </View>

      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : !links || links.length === 0 ? (
        <Text className="text-sm text-muted-foreground">Nothing linked yet.</Text>
      ) : (
        <View className="gap-1.5">
          {links.map((item) => (
            <View key={item.link.id} className="rounded-xl bg-surface-muted px-3 py-2.5">
              <Text className="text-sm text-foreground">{item.title}</Text>
              <Text className="text-xs text-muted-foreground">
                {item.otherType} · {item.link.rel_type}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
