import * as Haptics from "expo-haptics";
import type { LucideIcon } from "lucide-react-native";
import { useRef } from "react";
import { Text, View } from "react-native";
import Swipeable, { type SwipeableMethods } from "react-native-gesture-handler/ReanimatedSwipeable";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

import { cn } from "@/core/ui/lib/utils";

export interface SwipeableRowProps {
  children: React.ReactNode;
  actionLabel: string;
  actionIcon: LucideIcon;
  actionColorClassName?: string;
  onTrigger: () => void;
}

function RightAction({
  progress,
  label,
  icon: Icon,
  colorClassName,
}: {
  progress: SharedValue<number>;
  label: string;
  icon: LucideIcon;
  colorClassName: string;
}) {
  const style = useAnimatedStyle(() => ({ opacity: progress.value }));

  return (
    <Animated.View
      style={style}
      className={cn("flex-1 flex-row items-center justify-end px-6 rounded-2xl", colorClassName)}
    >
      <View className="items-center gap-1">
        <Icon size={20} color="white" />
        <Text className="text-xs font-medium text-white">{label}</Text>
      </View>
    </Animated.View>
  );
}

/** Full right-swipe triggers the action with a haptic thunk, iOS-Mail style. */
export function SwipeableRow({
  children,
  actionLabel,
  actionIcon,
  actionColorClassName = "bg-success",
  onTrigger,
}: SwipeableRowProps) {
  const ref = useRef<SwipeableMethods>(null);

  return (
    <Swipeable
      ref={ref}
      friction={2}
      rightThreshold={56}
      renderRightActions={(progress) => (
        <RightAction
          progress={progress}
          label={actionLabel}
          icon={actionIcon}
          colorClassName={actionColorClassName}
        />
      )}
      onSwipeableWillOpen={() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onTrigger();
        ref.current?.close();
      }}
    >
      {children}
    </Swipeable>
  );
}
