import type { ModuleDefinition } from "@/core/modules/types";

// Populated by each module's definition.ts starting M3 (import + push here).
// Empty in M1: the platform plumbing works before any concrete module exists.
const definitions = new Map<string, ModuleDefinition>();

export function registerModule(definition: ModuleDefinition): void {
  if (definitions.has(definition.slug)) {
    throw new Error(`Module "${definition.slug}" is already registered.`);
  }
  definitions.set(definition.slug, definition);
}

export function getModuleDefinition(slug: string): ModuleDefinition | undefined {
  return definitions.get(slug);
}

export function getAllModuleDefinitions(): ModuleDefinition[] {
  return Array.from(definitions.values());
}
