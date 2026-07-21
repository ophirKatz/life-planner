import type { AppEvent, AppEventHandler, AppEventType } from "@/core/events/types";

type Listener = AppEventHandler<AppEventType>;

const listeners = new Map<AppEventType, Set<Listener>>();

export function on<T extends AppEventType>(type: T, handler: AppEventHandler<T>): () => void {
  const set = listeners.get(type) ?? new Set<Listener>();
  set.add(handler as Listener);
  listeners.set(type, set);
  return () => set.delete(handler as Listener);
}

export function emit(event: AppEvent): void {
  listeners.get(event.type)?.forEach((handler) => handler(event));
}
