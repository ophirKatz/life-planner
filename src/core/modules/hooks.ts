import { useMemo } from "react";

import { useUserModules } from "@/core/modules/data/useUserModules";
import { getModuleDefinition } from "@/core/modules/registry";
import type { ModuleDefinition, QuickAddAction, WidgetComponent } from "@/core/modules/types";

/** Enabled ModuleDefinitions for the current user, in install order. */
export function useEnabledModules(): ModuleDefinition[] {
  const { data: userModules } = useUserModules();

  return useMemo(() => {
    if (!userModules) return [];
    return userModules
      .filter((um) => um.enabled)
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
