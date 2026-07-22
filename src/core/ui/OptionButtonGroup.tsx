import { View } from "react-native";

import { Button } from "@/core/ui/Button";
import { cn } from "@/core/ui/lib/utils";

export interface Option<T> {
  value: T;
  label: string;
}

export interface OptionButtonGroupProps<T> {
  options: readonly Option<T>[];
  value: T;
  onChange: (value: T) => void;
  /** Override the default value-equality check — e.g. TaskForm compares
   * due_at by calendar day, not exact ISO string. */
  isSelected?: (option: Option<T>) => boolean;
  size?: "sm" | "default";
  /** Each button grows to share the row equally, instead of hugging its label. */
  equalWidth?: boolean;
  wrap?: boolean;
  className?: string;
}

/** Single-select labeled button row — the "Today / Tomorrow / None",
 * "Low / Medium / High" pattern repeated across nearly every form in the
 * app. One shared implementation instead of a `variant={x === y ? ... }`
 * block per form. */
export function OptionButtonGroup<T>({
  options,
  value,
  onChange,
  isSelected,
  size = "sm",
  equalWidth,
  wrap,
  className,
}: OptionButtonGroupProps<T>) {
  const selected = (option: Option<T>) => (isSelected ? isSelected(option) : option.value === value);

  return (
    <View className={cn("flex-row gap-2", wrap && "flex-wrap", className)}>
      {options.map((option, index) => (
        <Button
          key={index}
          label={option.label}
          size={size}
          variant={selected(option) ? "default" : "secondary"}
          className={equalWidth ? "flex-1" : undefined}
          onPress={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}
