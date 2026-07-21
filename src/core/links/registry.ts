import type { LinkableEntity } from "@/core/modules/types";

// type -> table/resolver registry (DESIGN.md §4.2: "app-layer validation, a
// registry maps type -> table"). Populated by modules' definition.ts via
// registerLinkable, starting M3 (e.g. "person" -> people, "task" -> tasks).
const linkableTypes = new Map<string, LinkableEntity>();

export function registerLinkable(entity: LinkableEntity): void {
  if (linkableTypes.has(entity.type)) {
    throw new Error(`Linkable type "${entity.type}" is already registered.`);
  }
  linkableTypes.set(entity.type, entity);
}

export function getLinkableEntity(type: string): LinkableEntity | undefined {
  return linkableTypes.get(type);
}

export function isKnownLinkableType(type: string): boolean {
  return linkableTypes.has(type);
}
