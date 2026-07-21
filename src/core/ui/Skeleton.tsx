import { MotiView } from "moti";
import { View, type ViewProps } from "react-native";

import { cn } from "@/core/ui/lib/utils";

export function Skeleton({ className, ...props }: ViewProps) {
  return (
    <MotiView
      from={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ type: "timing", duration: 700, loop: true, repeatReverse: true }}
      className={cn("rounded-xl bg-surface-muted", className)}
      {...props}
    />
  );
}

export function SkeletonListItem() {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-surface px-4 py-3.5">
      <Skeleton className="h-10 w-10 rounded-xl" />
      <View className="flex-1 gap-2">
        <Skeleton className="h-4 w-2/3 rounded-md" />
        <Skeleton className="h-3 w-1/3 rounded-md" />
      </View>
    </View>
  );
}
