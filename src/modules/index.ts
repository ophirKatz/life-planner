// Bootstraps every first-party module: importing this file registers each
// module's ModuleDefinition and linkable entities. Adding a module means
// adding one import + one registerModule/registerLinkable call here — see
// DESIGN.md §5.1.
import { registerLinkable } from "@/core/links/registry";
import { registerModule } from "@/core/modules/registry";
import { tasksModule } from "@/modules/tasks/definition";

registerModule(tasksModule);
tasksModule.linkableEntities.forEach(registerLinkable);
