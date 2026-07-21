import { create } from "zustand";

export interface PendingScheduledAsConfirm {
  taskId: string;
  eventId: string;
  eventTitle: string;
}

interface ScheduledAsState {
  pending: PendingScheduledAsConfirm | null;
  ask: (pending: PendingScheduledAsConfirm) => void;
  clear: () => void;
}

/** Drives the "completing this task offers to resolve/remove the linked
 * event" confirm (DESIGN.md §8) — an explicit, user-confirmed automation,
 * not a magical background one. */
export const useScheduledAsStore = create<ScheduledAsState>((set) => ({
  pending: null,
  ask: (pending) => set({ pending }),
  clear: () => set({ pending: null }),
}));
