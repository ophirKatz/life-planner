import { cva, type VariantProps } from "class-variance-authority";
import { Children, cloneElement, isValidElement } from "react";
import { ActivityIndicator, Pressable, Text, type GestureResponderEvent, type PressableProps } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";

import { cn } from "@/core/ui/lib/utils";
import { useThemeColors } from "@/core/ui/theme/useThemeColors";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const buttonVariants = cva("flex-row items-center justify-center gap-2 rounded-2xl disabled:opacity-50", {
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
});

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
  onPressIn,
  onPressOut,
  ...props
}: ButtonProps) {
  const colors = useThemeColors();
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = (e: GestureResponderEvent) => {
    scale.value = withSpring(0.96, { duration: 200 });
    onPressIn?.(e);
  };
  const handlePressOut = (e: GestureResponderEvent) => {
    scale.value = withSpring(1, { duration: 200 });
    onPressOut?.(e);
  };

  // Icon children (passed as JSX, not via `label`) don't automatically pick
  // up the semantic text color the way <Text> does with a className — clone
  // them to inject the right one per variant, unless the caller already set
  // an explicit color themselves.
  const iconColor =
    variant === "default" || variant === "destructive" ? "white" : colors.foreground;
  const coloredChildren = Children.map(children, (child) =>
    isValidElement<{ color?: string }>(child) && child.props.color === undefined
      ? cloneElement(child, { color: iconColor })
      : child
  );

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled || isLoading}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === "secondary" || variant === "outline" || variant === "ghost" ? undefined : "white"} />
      ) : label ? (
        <Text className={buttonTextVariants({ variant })}>{label}</Text>
      ) : (
        coloredChildren
      )}
    </AnimatedPressable>
  );
}
