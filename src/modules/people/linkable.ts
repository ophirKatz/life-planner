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

export async function listAllPeople(): Promise<ResolvedLinkTarget[]> {
  const { data, error } = await supabase
    .from("people")
    .select("id, display_name, emails")
    .order("display_name");
  if (error) throw error;
  return data.map((p) => ({ id: p.id, title: p.display_name, subtitle: p.emails[0] }));
}
