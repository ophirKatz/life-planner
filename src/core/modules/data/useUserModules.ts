import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { ModuleCatalogRow } from "@/core/modules/types";

export const userModulesKey = ["modules", "user"] as const;

export interface UserModuleRow {
  id: string;
  module_id: string;
  enabled: boolean;
  position: number;
  settings: Record<string, unknown>;
  module: ModuleCatalogRow;
}

/** The current user's installs, joined with the catalog row for each module,
 * in user-defined dashboard order (DESIGN.md §5.2). */
export function useUserModules() {
  return useQuery({
    queryKey: userModulesKey,
    queryFn: async (): Promise<UserModuleRow[]> => {
      const { data, error } = await supabase
        .from("user_modules")
        .select("id, module_id, enabled, position, settings, module:modules(*)")
        .order("position", { ascending: true });
      if (error) throw error;
      return data as unknown as UserModuleRow[];
    },
  });
}

/** Enable/disable a module for the current user, creating the row if absent.
 * Newly-enabled modules are appended to the end of the dashboard order. */
export function useSetModuleEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, enabled }: { moduleId: string; enabled: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");

      const { count } = await supabase
        .from("user_modules")
        .select("id", { count: "exact", head: true })
        .eq("user_id", auth.user.id)
        .eq("enabled", true);

      const { error } = await supabase
        .from("user_modules")
        .upsert(
          { user_id: auth.user.id, module_id: moduleId, enabled, position: count ?? 0 },
          { onConflict: "user_id,module_id", ignoreDuplicates: false }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userModulesKey });
    },
  });
}

/** Swaps dashboard `position` between two of the user's modules (up/down
 * reorder in the Store, same dependency-free technique as Shopping items). */
export function useSwapModulePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ a, b }: { a: UserModuleRow; b: UserModuleRow }): Promise<void> => {
      const { error: e1 } = await supabase
        .from("user_modules")
        .update({ position: b.position })
        .eq("id", a.id);
      if (e1) throw e1;
      const { error: e2 } = await supabase
        .from("user_modules")
        .update({ position: a.position })
        .eq("id", b.id);
      if (e2) throw e2;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: userModulesKey }),
  });
}
