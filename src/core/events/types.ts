// Small, typed catalog (DESIGN.md §8) — not a rules engine. Extend only when
// an actual automation needs a new event, not speculatively.
export type AppEvent =
  | { type: "record.created"; entityType: string; entityId: string }
  | { type: "record.updated"; entityType: string; entityId: string; data?: Record<string, unknown> }
  | { type: "record.deleted"; entityType: string; entityId: string }
  | { type: "link.created"; fromType: string; fromId: string; toType: string; toId: string; relType: string }
  | { type: "habit.completed"; habitId: string };

export type AppEventType = AppEvent["type"];
export type AppEventOf<T extends AppEventType> = Extract<AppEvent, { type: T }>;
export type AppEventHandler<T extends AppEventType = AppEventType> = (event: AppEventOf<T>) => void;
