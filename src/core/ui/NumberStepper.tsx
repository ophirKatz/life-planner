import { Text, View } from "react-native";

import { Button } from "@/core/ui/Button";
import { cn } from "@/core/ui/lib/utils";

export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  className?: string;
}

/** The "-  N  +" stepper repeated for habit targets, recipe servings, etc. */
export function NumberStepper({ value, onChange, min = 0, max = Infinity, step = 1, label, className }: NumberStepperProps) {
  return (
    <View className={cn("gap-1.5", className)}>
      {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
      <View className="flex-row items-center gap-4">
        <Button size="icon" variant="secondary" label="-" onPress={() => onChange(Math.max(min, value - step))} />
        <Text className="text-lg font-semibold text-foreground tabular-nums w-8 text-center">{value}</Text>
        <Button size="icon" variant="secondary" label="+" onPress={() => onChange(Math.min(max, value + step))} />
      </View>
    </View>
  );
}
