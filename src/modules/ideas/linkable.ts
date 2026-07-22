import { supabase } from "@/core/db/supabase";
import type { ResolvedLinkTarget } from "@/core/links/types";

export async function resolveIdea(id: string): Promise<ResolvedLinkTarget | null> {
  const { data, error } = await supabase.from("ideas").select("id, title").eq("id", id).single();
  if (error || !data) return null;
  return { id: data.id, title: data.title };
}

export async function listAllIdeas(): Promise<ResolvedLinkTarget[]> {
  const { data, error } = await supabase.from("ideas").select("id, title, status").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map((idea) => ({ id: idea.id, title: idea.title, subtitle: idea.status }));
}
