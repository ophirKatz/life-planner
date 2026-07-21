// Bootstraps every first-party module: importing this file registers each
// module's ModuleDefinition and linkable entities. Adding a module means
// adding one import + one registerModule/registerLinkable call here — see
// DESIGN.md §5.1.
import { registerLinkable } from "@/core/links/registry";
import { registerModule } from "@/core/modules/registry";
import { peopleModule } from "@/modules/people/definition";
import { shoppingModule } from "@/modules/shopping/definition";
import { tasksModule } from "@/modules/tasks/definition";

const modules = [tasksModule, peopleModule, shoppingModule];

modules.forEach((mod) => {
  registerModule(mod);
  mod.linkableEntities.forEach(registerLinkable);
});
