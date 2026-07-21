import { Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export interface StreakRingProps {
  /** 0-1 progress for today's period (checked-in vs not, relative to target). */
  progress: number;
  streak: number;
  color?: string;
  size?: number;
}

export function StreakRing({ progress, streak, color = "#6366f1", size = 56 }: StreakRingProps) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(Math.max(progress, 0), 1));

  return (
    <View style={{ width: size, height: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(220 14% 93%)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text className="text-sm font-semibold text-foreground tabular-nums">{streak}</Text>
    </View>
  );
}
