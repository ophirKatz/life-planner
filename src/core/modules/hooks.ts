import { useMemo } from "react";

import { useUserModules } from "@/core/modules/data/useUserModules";
import { getModuleDefinition } from "@/core/modules/registry";
import type { ModuleDefinition, QuickAddAction, WidgetComponent } from "@/core/modules/types";

/** Enabled ModuleDefinitions for the current user, in install order.
 * `module.is_active` is the developer kill switch (modules catalog, DESIGN.md
 * §5.2) — checked here, not just at Store-listing time, so flipping it off
 * hides the module app-wide immediately, even for users who already had it
 * enabled. */
export function useEnabledModules(): ModuleDefinition[] {
  const { data: userModules } = useUserModules();

  return useMemo(() => {
    if (!userModules) return [];
    return userModules
      .filter((um) => um.enabled && um.module.is_active)
      .map((um) => getModuleDefinition(um.module.slug))
      .filter((def): def is ModuleDefinition => def !== undefined);
  }, [userModules]);
}

export interface DashboardWidgetEntry {
  key: string;
  slug: string;
  Widget: WidgetComponent;
}

export function useModuleWidgets(): DashboardWidgetEntry[] {
  const enabled = useEnabledModules();
  return useMemo(
    () =>
      enabled.flatMap((m) =>
        m.dashboardWidgets.map((Widget, i) => ({ key: `${m.slug}.${i}`, slug: m.slug, Widget }))
      ),
    [enabled]
  );
}

export function useQuickAddActions(): QuickAddAction[] {
  const enabled = useEnabledModules();
  return useMemo(() => enabled.flatMap((m) => m.quickAddActions), [enabled]);
}

/** For tab screens that map 1:1 to a module (e.g. the Calendar tab) and need
 * to show/hide themselves based on enablement, not just their dashboard widget. */
export function useIsModuleEnabled(slug: string): { isEnabled: boolean; isLoading: boolean } {
  const { data: userModules, isLoading } = useUserModules();
  const isEnabled = !!userModules?.some((um) => um.module.slug === slug && um.enabled && um.module.is_active);
  return { isEnabled, isLoading };
}
