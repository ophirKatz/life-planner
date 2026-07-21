import * as CheckboxPrimitive from "@rn-primitives/checkbox";
import * as Haptics from "expo-haptics";
import { Check } from "lucide-react-native";

import { cn } from "@/core/ui/lib/utils";

export interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  accessibilityLabel?: string;
}

export function Checkbox({
  checked,
  onCheckedChange,
  disabled,
  className,
  accessibilityLabel,
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={(next) => {
        Haptics.selectionAsync();
        onCheckedChange(next);
      }}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      className={cn(
        "h-6 w-6 items-center justify-center rounded-md border-2 border-border",
        checked && "bg-accent border-accent",
        disabled && "opacity-50",
        className
      )}
    >
      <CheckboxPrimitive.Indicator>
        <Check size={16} color="white" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
