import { format } from "date-fns";

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

export async function listAllCalendarEvents(): Promise<ResolvedLinkTarget[]> {
  const { data, error } = await supabase
    .from("calendar_events")
    .select("id, title, starts_at")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(100);
  if (error) throw error;
  return data.map((e) => ({ id: e.id, title: e.title, subtitle: format(new Date(e.starts_at), "PPp") }));
}
