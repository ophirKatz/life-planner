import { supabase } from "@/core/db/supabase";
import type { Json } from "@/core/db/types";
import { getLinkableEntity, isKnownLinkableType } from "@/core/links/registry";
import type { CreateLinkInput, LinkRow, ResolvedLinkTarget } from "@/core/links/types";

function assertKnownType(type: string) {
  if (!isKnownLinkableType(type)) {
    throw new Error(
      `"${type}" is not a registered linkable type. Register it via registerLinkable() in the owning module's definition.ts.`
    );
  }
}

export async function createLink(input: CreateLinkInput): Promise<LinkRow> {
  assertKnownType(input.fromType);
  assertKnownType(input.toType);

  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) throw new Error("Not signed in.");

  const { data, error } = await supabase
    .from("links")
    .insert({
      user_id: auth.user.id,
      from_type: input.fromType,
      from_id: input.fromId,
      to_type: input.toType,
      to_id: input.toId,
      rel_type: input.relType,
      data: (input.data ?? {}) as Json,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteLink(id: string): Promise<void> {
  const { error } = await supabase.from("links").delete().eq("id", id);
  if (error) throw error;
}

/** Links where the given entity is either side, for its "linked items" UI. */
export async function getLinksForEntity(type: string, id: string): Promise<LinkRow[]> {
  const { data, error } = await supabase
    .from("links")
    .select("*")
    .or(`and(from_type.eq.${type},from_id.eq.${id}),and(to_type.eq.${type},to_id.eq.${id})`);
  if (error) throw error;
  return data;
}

/** Resolves a link endpoint to a display-friendly { id, title }, via the
 * registered module's own resolver (each module owns how its rows render). */
export async function resolveLinkable(type: string, id: string): Promise<ResolvedLinkTarget | null> {
  const entity = getLinkableEntity(type);
  if (!entity) return null;
  return entity.resolve(id);
}
