import { AnimatePresence, MotiView } from "moti";
import { View } from "react-native";

const COLORS = ["#6366f1", "#f59e0b", "#22c55e", "#ec4899", "#0ea5e9"];
const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const angle = (i / 14) * Math.PI * 2;
  return {
    id: i,
    color: COLORS[i % COLORS.length],
    dx: Math.cos(angle) * 60,
    dy: Math.sin(angle) * 60,
  };
});

export interface ConfettiBurstProps {
  /** Increment this to re-fire the burst (remounts the particle set). */
  triggerKey: number;
}

/** Lightweight, dependency-free confetti — a Moti particle burst, no canvas lib. */
export function ConfettiBurst({ triggerKey }: ConfettiBurstProps) {
  if (triggerKey === 0) return null;

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 items-center justify-center"
      key={triggerKey}
    >
      <AnimatePresence>
        {PARTICLES.map((p) => (
          <MotiView
            key={p.id}
            from={{ translateX: 0, translateY: 0, opacity: 1, scale: 1 }}
            animate={{ translateX: p.dx, translateY: p.dy, opacity: 0, scale: 0.4 }}
            transition={{ type: "timing", duration: 650 }}
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: p.color,
            }}
          />
        ))}
      </AnimatePresence>
    </View>
  );
}
