import type { LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Text } from "react-native";

import { useCreateLink } from "@/core/links/data/useCreateLink";
import { useLinkableOptions } from "@/core/links/data/useLinkableOptions";
import { LinkPickerSheet } from "@/core/links/LinkPickerSheet";
import { Button } from "@/core/ui/Button";

export interface LinkEntityButtonProps {
  label: string;
  icon?: LucideIcon;
  pickerTitle: string;
  sourceType: string;
  sourceId: string;
  targetType: string;
  relType: string;
}

/** A "Link a <thing>" button: opens a picker over every row of `targetType`
 * and creates a `links` row on selection. Used from detail screens to build
 * the person<->task/event and task<->event relationships (DESIGN.md §4.5). */
export function LinkEntityButton({
  label,
  icon: Icon,
  pickerTitle,
  sourceType,
  sourceId,
  targetType,
  relType,
}: LinkEntityButtonProps) {
  const [open, setOpen] = useState(false);
  const { data: options } = useLinkableOptions(targetType, open);
  const createLink = useCreateLink();

  return (
    <>
      <Button variant="secondary" onPress={() => setOpen(true)}>
        {Icon ? <Icon size={16} /> : null}
        <Text className="text-base font-medium text-foreground">{label}</Text>
      </Button>

      <LinkPickerSheet
        open={open}
        onOpenChange={setOpen}
        title={pickerTitle}
        options={options ?? []}
        onSelect={(id) =>
          createLink.mutate({ fromType: sourceType, fromId: sourceId, toType: targetType, toId: id, relType })
        }
      />
    </>
  );
}
