import * as SelectPrimitive from "@rn-primitives/select";
import { Check, ChevronDown } from "lucide-react-native";

import { cn } from "@/core/ui/lib/utils";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

export const Select = SelectPrimitive.Root;

export function SelectTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger>) {
  const colors = useThemeColors();
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "flex-row items-center justify-between rounded-xl border border-border bg-surface px-4 py-3",
        className
      )}
      {...props}
    >
      {children as React.ReactNode}
      <ChevronDown size={18} color={colors.mutedForeground} />
    </SelectPrimitive.Trigger>
  );
}

export function SelectValue({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return (
    <SelectPrimitive.Value className={cn("text-base text-foreground", className)} {...props} />
  );
}

export function SelectContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Overlay className="absolute inset-0">
        <SelectPrimitive.Content
          className={cn(
            "min-w-[8rem] gap-0.5 rounded-2xl border border-border bg-surface p-1.5 shadow-md",
            className
          )}
          {...props}
        >
          <SelectPrimitive.Viewport>{children}</SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Overlay>
    </SelectPrimitive.Portal>
  );
}

export function SelectItem({
  className,
  label,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  const colors = useThemeColors();
  return (
    <SelectPrimitive.Item
      label={label}
      className={cn(
        "flex-row items-center justify-between rounded-lg px-3 py-2.5 active:bg-surface-muted",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="text-base text-foreground" />
      <SelectPrimitive.ItemIndicator>
        <Check size={16} color={colors.accent} />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
}
