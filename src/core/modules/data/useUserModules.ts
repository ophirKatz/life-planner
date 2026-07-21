import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { ModuleCatalogRow } from "@/core/modules/types";

export const userModulesKey = ["modules", "user"] as const;

export interface UserModuleRow {
  id: string;
  module_id: string;
  enabled: boolean;
  settings: Record<string, unknown>;
  module: ModuleCatalogRow;
}

/** The current user's installs, joined with the catalog row for each module. */
export function useUserModules() {
  return useQuery({
    queryKey: userModulesKey,
    queryFn: async (): Promise<UserModuleRow[]> => {
      const { data, error } = await supabase
        .from("user_modules")
        .select("id, module_id, enabled, settings, module:modules(*)")
        .order("installed_at", { ascending: true });
      if (error) throw error;
      return data as unknown as UserModuleRow[];
    },
  });
}

/** Enable/disable a module for the current user, creating the row if absent. */
export function useSetModuleEnabled() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ moduleId, enabled }: { moduleId: string; enabled: boolean }) => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("Not signed in.");

      const { error } = await supabase
        .from("user_modules")
        .upsert(
          { user_id: auth.user.id, module_id: moduleId, enabled },
          { onConflict: "user_id,module_id" }
        );
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userModulesKey });
    },
  });
}
