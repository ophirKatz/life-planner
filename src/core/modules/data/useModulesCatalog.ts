import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";
import type { ModuleCatalogRow } from "@/core/modules/types";

export const modulesCatalogKey = ["modules", "catalog"] as const;

/** The full marketplace catalog (seeded modules table), for the Store screen. */
export function useModulesCatalog() {
  return useQuery({
    queryKey: modulesCatalogKey,
    queryFn: async (): Promise<ModuleCatalogRow[]> => {
      const { data, error } = await supabase
        .from("modules")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}
