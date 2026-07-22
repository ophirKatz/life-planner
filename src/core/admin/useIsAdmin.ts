import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/core/db/supabase";

export const isAdminKey = ["admin", "is-admin"] as const;

/** Whether the current user is an admin (profiles.is_admin). Purely a UI
 * gate — actual write access to admin-only tables (modules, feature_flags)
 * is enforced by RLS regardless of what this returns. */
export function useIsAdmin() {
  return useQuery({
    queryKey: isAdminKey,
    queryFn: async (): Promise<boolean> => {
      const { data, error } = await supabase.from("profiles").select("is_admin").single();
      if (error) throw error;
      return data.is_admin;
    },
  });
}
