import { cva, type VariantProps } from "class-variance-authority";
import { ActivityIndicator, Pressable, Text, type PressableProps } from "react-native";

import { cn } from "@/core/ui/lib/utils";

const buttonVariants = cva(
  "flex-row items-center justify-center gap-2 rounded-2xl active:opacity-80 disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-accent",
        secondary: "bg-surface-muted",
        outline: "bg-transparent border border-border",
        ghost: "bg-transparent",
        destructive: "bg-danger",
      },
      size: {
        default: "px-5 py-3.5",
        sm: "px-4 py-2.5",
        lg: "px-6 py-4",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  }
);

const buttonTextVariants = cva("text-base font-medium", {
  variants: {
    variant: {
      default: "text-accent-foreground",
      secondary: "text-foreground",
      outline: "text-foreground",
      ghost: "text-foreground",
      destructive: "text-danger-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface ButtonProps
  extends Omit<PressableProps, "children">,
    VariantProps<typeof buttonVariants> {
  children?: React.ReactNode;
  label?: string;
  isLoading?: boolean;
  className?: string;
}

export function Button({
  variant,
  size,
  label,
  children,
  isLoading,
  disabled,
  className,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || isLoading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "outline" || variant === "ghost" ? undefined : "white"} />
      ) : label ? (
        <Text className={buttonTextVariants({ variant })}>{label}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
