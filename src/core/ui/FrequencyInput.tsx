import { View } from "react-native";

import { Button } from "@/core/ui/Button";
import { NumberStepper } from "@/core/ui/NumberStepper";
import { OptionButtonGroup, type Option } from "@/core/ui/OptionButtonGroup";

export type FrequencyUnit = "day" | "week" | "month" | "year";

export interface FrequencyValue {
  interval: number;
  unit: FrequencyUnit;
}

const UNIT_LABEL: Record<FrequencyUnit, string> = { day: "Day", week: "Week", month: "Month", year: "Year" };

const UNIT_OPTIONS: Option<FrequencyUnit>[] = (["day", "week", "month", "year"] as FrequencyUnit[]).map((unit) => ({
  value: unit,
  label: UNIT_LABEL[unit],
}));

const PRESETS: { value: FrequencyValue | null; label: string }[] = [
  { value: { interval: 1, unit: "day" }, label: "Daily" },
  { value: { interval: 1, unit: "week" }, label: "Weekly" },
  { value: { interval: 1, unit: "month" }, label: "Monthly" },
  { value: { interval: 1, unit: "year" }, label: "Yearly" },
];

const NEVER_PRESET = { value: null, label: "Never" };
const CUSTOM_DEFAULT: FrequencyValue = { interval: 2, unit: "week" };

function sameFrequency(a: FrequencyValue | null, b: FrequencyValue | null): boolean {
  if (a === null || b === null) return a === b;
  return a.interval === b.interval && a.unit === b.unit;
}

export interface FrequencyInputProps {
  value: FrequencyValue | null;
  onChange: (value: FrequencyValue | null) => void;
  /** Whether "Never" is an offered preset — off for things that always
   * repeat on some cadence. Only event repetition uses this today. */
  allowNever?: boolean;
}

/** Recurrence picker: quick presets (Daily/Weekly/Monthly/Yearly, optionally
 * Never) plus a "Custom" option revealing an "every N [unit]" stepper for
 * anything the presets don't cover (e.g. every 2 weeks). */
export function FrequencyInput({ value, onChange, allowNever = true }: FrequencyInputProps) {
  const presets = allowNever ? [NEVER_PRESET, ...PRESETS] : PRESETS;
  const isCustom = !presets.some((preset) => sameFrequency(preset.value, value));

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.label}
            label={preset.label}
            size="sm"
            variant={!isCustom && sameFrequency(preset.value, value) ? "default" : "secondary"}
            onPress={() => onChange(preset.value)}
          />
        ))}
        <Button
          label="Custom"
          size="sm"
          variant={isCustom ? "default" : "secondary"}
          onPress={() => onChange(value ?? CUSTOM_DEFAULT)}
        />
      </View>

      {isCustom && value ? (
        <View className="gap-3">
          <NumberStepper
            label="Every"
            value={value.interval}
            min={1}
            max={30}
            onChange={(interval) => onChange({ ...value, interval })}
          />
          <OptionButtonGroup
            options={UNIT_OPTIONS}
            value={value.unit}
            onChange={(unit) => onChange({ ...value, unit })}
            wrap
          />
        </View>
      ) : null}
    </View>
  );
}
