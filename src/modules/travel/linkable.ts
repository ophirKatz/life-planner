import { supabase } from "@/core/db/supabase";
import type { ResolvedLinkTarget } from "@/core/links/types";

export async function resolveTrip(id: string): Promise<ResolvedLinkTarget | null> {
  const { data, error } = await supabase.from("trips").select("id, name, destination").eq("id", id).single();
  if (error || !data) return null;
  return { id: data.id, title: data.name, subtitle: data.destination ?? undefined };
}

export async function listAllTrips(): Promise<ResolvedLinkTarget[]> {
  const { data, error } = await supabase
    .from("trips")
    .select("id, name, destination")
    .order("start_date", { ascending: false });
  if (error) throw error;
  return data.map((trip) => ({ id: trip.id, title: trip.name, subtitle: trip.destination ?? undefined }));
}
