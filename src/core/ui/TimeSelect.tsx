import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/ui/Select";

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour24 = Math.floor(i / 2);
  const minute = i % 2 === 0 ? "00" : "30";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 < 12 ? "AM" : "PM";
  return { value: `${String(hour24).padStart(2, "0")}:${minute}`, label: `${hour12}:${minute} ${period}` };
});

export interface TimeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimeSelect({ value, onChange }: TimeSelectProps) {
  const selected = TIME_OPTIONS.find((o) => o.value === value);

  return (
    <Select
      value={selected ? { value: selected.value, label: selected.label } : undefined}
      onValueChange={(option) => option && onChange(option.value)}
    >
      <SelectTrigger>
        <SelectValue placeholder="Time" />
      </SelectTrigger>
      <SelectContent>
        {TIME_OPTIONS.map((option) => (
          <SelectItem key={option.value} label={option.label} value={option.value} />
        ))}
      </SelectContent>
    </Select>
  );
}
