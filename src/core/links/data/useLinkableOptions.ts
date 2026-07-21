import { useQuery } from "@tanstack/react-query";

import { getLinkableEntity } from "@/core/links/registry";
import type { ResolvedLinkTarget } from "@/core/links/types";

/** Every pickable row for a registered linkable type — powers LinkPickerSheet. */
export function useLinkableOptions(type: string, enabled = true) {
  return useQuery<ResolvedLinkTarget[]>({
    queryKey: ["links", "options", type],
    queryFn: async () => {
      const entity = getLinkableEntity(type);
      if (!entity) return [];
      return entity.listAll();
    },
    enabled,
  });
}
