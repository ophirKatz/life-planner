import * as TabsPrimitive from "@rn-primitives/tabs";
import { Text } from "react-native";

import { cn } from "@/core/ui/lib/utils";

export const Tabs = TabsPrimitive.Root;
export const TabsContent = TabsPrimitive.Content;

export function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      className={cn("flex-row rounded-2xl bg-surface-muted p-1", className)}
      {...props}
    />
  );
}

export function TabsTrigger({
  value,
  className,
  children,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  const { value: activeValue } = TabsPrimitive.useRootContext();
  const isActive = activeValue === value;

  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        "flex-1 items-center rounded-xl py-2",
        isActive && "bg-surface shadow-sm",
        className
      )}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className={cn("text-sm font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>
          {children}
        </Text>
      ) : (
        children
      )}
    </TabsPrimitive.Trigger>
  );
}
