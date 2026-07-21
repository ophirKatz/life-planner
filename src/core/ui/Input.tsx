import { forwardRef } from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { cn } from "@/core/ui/lib/utils";

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, containerClassName, className, ...props }, ref) => {
    return (
      <View className={cn("gap-1.5", containerClassName)}>
        {label ? <Text className="text-sm font-medium text-foreground">{label}</Text> : null}
        <TextInput
          ref={ref}
          placeholderTextColor="hsl(220 9% 46%)"
          className={cn(
            "rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground",
            error && "border-danger",
            className
          )}
          {...props}
        />
        {error ? <Text className="text-sm text-danger">{error}</Text> : null}
      </View>
    );
  }
);
Input.displayName = "Input";
