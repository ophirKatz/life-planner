import { View } from "react-native";

import { useScheduledAsStore } from "@/core/events/scheduled-as-store";
import { useDeleteCalendarEvent } from "@/modules/calendar/data/useCalendarEvents";
import { Button } from "@/core/ui/Button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/core/ui/Dialog";

/** Mounted once at the app root — see DESIGN.md §8 item 4, the one
 * cross-module automation example that ships in v1. */
export function ScheduledAsConfirmDialog() {
  const { pending, clear } = useScheduledAsStore();
  const deleteEvent = useDeleteCalendarEvent();

  return (
    <Dialog open={!!pending} onOpenChange={(open) => !open && clear()}>
      <DialogContent>
        <DialogTitle>Remove the linked event?</DialogTitle>
        <DialogDescription>
          &ldquo;{pending?.eventTitle}&rdquo; is scheduled for this task. Since you marked it done,
          remove it from your calendar too?
        </DialogDescription>
        <View className="flex-row gap-2">
          <Button label="Keep it" variant="secondary" className="flex-1" onPress={clear} />
          <Button
            label="Remove"
            variant="destructive"
            className="flex-1"
            isLoading={deleteEvent.isPending}
            onPress={() => {
              if (pending) deleteEvent.mutate(pending.eventId);
              clear();
            }}
          />
        </View>
      </DialogContent>
    </Dialog>
  );
}
