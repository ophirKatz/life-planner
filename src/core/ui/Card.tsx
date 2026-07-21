import { Text, View, type ViewProps } from "react-native";

import { cn } from "@/core/ui/lib/utils";

export function Card({ className, ...props }: ViewProps) {
  return (
    <View
      className={cn("rounded-2xl bg-surface border border-border p-4 shadow-sm", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn("text-lg font-semibold text-foreground", className)} {...props} />;
}

export function CardDescription({ className, ...props }: React.ComponentProps<typeof Text>) {
  return <Text className={cn("text-sm text-muted-foreground mt-1", className)} {...props} />;
}
