import { getLinksForEntity, resolveLinkable } from "@/core/links/client";
import { useScheduledAsStore } from "@/core/events/scheduled-as-store";
import type { AppEvent } from "@/core/events/types";
import type { Automation } from "@/core/modules/types";

async function handleTaskUpdated(event: AppEvent) {
  if (event.type !== "record.updated" || event.entityType !== "task" || event.data?.status !== "done") {
    return;
  }

  const links = await getLinksForEntity("task", event.entityId);
  const scheduledAs = links.find((l) => l.rel_type === "scheduled_as");
  if (!scheduledAs) return;

  const eventId = scheduledAs.from_type === "calendar_event" ? scheduledAs.from_id : scheduledAs.to_id;
  const target = await resolveLinkable("calendar_event", eventId);
  if (!target) return;

  useScheduledAsStore.getState().ask({ taskId: event.entityId, eventId, eventTitle: target.title });
}

export const taskScheduledAsAutomation: Automation = {
  event: "record.updated",
  handler: handleTaskUpdated,
};
