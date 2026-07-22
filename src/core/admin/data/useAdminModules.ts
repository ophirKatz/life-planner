import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import { modulesCatalogKey } from "@/core/modules/data/useModulesCatalog";
import { userModulesKey } from "@/core/modules/data/useUserModules";
import type { ModuleCatalogRow, ModuleTier } from "@/core/modules/types";

export const adminModulesKey = ["admin", "modules"] as const;

/** Every module in the catalog, including inactive ones — unlike
 * useModulesCatalog (Store screen), which only shows what's currently live. */
export function useAdminModules() {
  return useQuery({
    queryKey: adminModulesKey,
    queryFn: async (): Promise<ModuleCatalogRow[]> => {
      const { data, error } = await supabase.from("modules").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

/** Admin-only: flip a module's is_active kill switch or its tier. Blocked by
 * RLS (modules_update_admin) for non-admins regardless of what the UI shows. */
export function useUpdateModule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      moduleId,
      patch,
    }: {
      moduleId: string;
      patch: Partial<{ is_active: boolean; tier: ModuleTier }>;
    }) => {
      const { error } = await supabase.from("modules").update(patch).eq("id", moduleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminModulesKey });
      queryClient.invalidateQueries({ queryKey: modulesCatalogKey });
      queryClient.invalidateQueries({ queryKey: userModulesKey });
    },
  });
}
