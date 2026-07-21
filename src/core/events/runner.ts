import { on } from "@/core/events/bus";
import type { ModuleDefinition } from "@/core/modules/types";

/** Subscribes every module's declared automations to the bus. Called once
 * from src/modules/index.ts after all modules are registered. */
export function registerAutomations(modules: ModuleDefinition[]): void {
  modules.forEach((mod) => {
    mod.automations?.forEach((automation) => {
      on(automation.event, automation.handler);
    });
  });
}
