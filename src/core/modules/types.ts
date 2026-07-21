import type { ComponentType } from "react";
import type { LucideIcon } from "lucide-react-native";

import type { Tables } from "@/core/db/types";

export type ModuleTier = "free" | "pro";

/** Row from the `modules` catalog table (seeded via migration, not user data). */
export type ModuleCatalogRow = Tables<"modules">;

export interface RouteRegistration {
  /** Path segment mounted under app/modules/[slug]/... by the module's own screens. */
  path: string;
  /** Human label for any generated navigation (headers, sitemaps). */
  title: string;
}

export type WidgetComponent = ComponentType<Record<string, never>>;

export interface QuickAddAction {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Opens the module's own create flow (a route or a sheet it controls). */
  onPress: () => void;
}

export interface LinkableEntity {
  /** Matches a `links.from_type`/`to_type` value, e.g. "person", "task". */
  type: string;
  table: string;
  label: string;
  resolve: (id: string) => Promise<{ id: string; title: string } | null>;
}

export interface IntegrationUsage {
  provider: "google";
  capability: "calendar" | "contacts";
}

export interface AutomationEvent {
  type: string;
  payload: unknown;
}

export interface Automation {
  event: string;
  handler: (event: AutomationEvent) => void | Promise<void>;
}

/**
 * The module contract every first-party module folder implements
 * (DESIGN.md §5.1). Adding a module = a new folder + a registry entry +
 * a migration + a seeded `modules` row — nothing else in the platform changes.
 */
export interface ModuleDefinition {
  slug: string;
  name: string;
  icon: LucideIcon;
  tier: ModuleTier;
  routes: RouteRegistration[];
  dashboardWidgets: WidgetComponent[];
  quickAddActions: QuickAddAction[];
  linkableEntities: LinkableEntity[];
  integrations?: IntegrationUsage[];
  automations?: Automation[];
}
