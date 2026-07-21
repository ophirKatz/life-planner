// Bootstraps every first-party module: importing this file registers each
// module's ModuleDefinition, linkable entities, and automations. Adding a
// module means adding one import + one entry in `modules` here — see
// DESIGN.md §5.1.
import { registerAutomations } from "@/core/events/runner";
import { registerLinkable } from "@/core/links/registry";
import { registerModule } from "@/core/modules/registry";
import { calendarModule } from "@/modules/calendar/definition";
import { habitsModule } from "@/modules/habits/definition";
import { peopleModule } from "@/modules/people/definition";
import { shoppingModule } from "@/modules/shopping/definition";
import { tasksModule } from "@/modules/tasks/definition";

const modules = [tasksModule, calendarModule, peopleModule, habitsModule, shoppingModule];

modules.forEach((mod) => {
  registerModule(mod);
  mod.linkableEntities.forEach(registerLinkable);
});

registerAutomations(modules);
