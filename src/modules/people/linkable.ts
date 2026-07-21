import { supabase } from "@/core/db/supabase";
import type { ResolvedLinkTarget } from "@/core/links/types";

export async function resolvePerson(id: string): Promise<ResolvedLinkTarget | null> {
  const { data, error } = await supabase
    .from("people")
    .select("id, display_name")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return { id: data.id, title: data.display_name };
}
