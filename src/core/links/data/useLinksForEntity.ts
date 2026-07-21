import { useQuery } from "@tanstack/react-query";

import { getLinksForEntity, resolveLinkable } from "@/core/links/client";
import type { LinkRow } from "@/core/links/types";

export interface ResolvedLink {
  link: LinkRow;
  otherType: string;
  otherId: string;
  title: string;
}

export const linksForEntityKey = (type: string, id: string) => ["links", type, id] as const;

/** Every link touching this entity, with the *other* side resolved to a display title. */
export function useLinksForEntity(type: string, id: string) {
  return useQuery({
    queryKey: linksForEntityKey(type, id),
    queryFn: async (): Promise<ResolvedLink[]> => {
      const links = await getLinksForEntity(type, id);
      const resolved = await Promise.all(
        links.map(async (link): Promise<ResolvedLink | null> => {
          const isFrom = link.from_type === type && link.from_id === id;
          const otherType = isFrom ? link.to_type : link.from_type;
          const otherId = isFrom ? link.to_id : link.from_id;
          const target = await resolveLinkable(otherType, otherId);
          if (!target) return null;
          return { link, otherType, otherId, title: target.title };
        })
      );
      return resolved.filter((r): r is ResolvedLink => r !== null);
    },
    enabled: !!id,
  });
}
