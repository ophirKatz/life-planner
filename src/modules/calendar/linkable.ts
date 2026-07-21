import { supabase } from "@/core/db/supabase";
import type { ResolvedLinkTarget } from "@/core/links/types";

export async function resolveCalendarEvent(id: string): Promise<ResolvedLinkTarget | null> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("id, title")
    .eq("id", id)
    .single();
  if (error || !data) return null;
  return { id: data.id, title: data.title };
}
