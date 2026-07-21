import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createLink } from "@/core/links/client";
import { linksForEntityKey } from "@/core/links/data/useLinksForEntity";
import { emit } from "@/core/events/bus";
import type { CreateLinkInput } from "@/core/links/types";

export function useCreateLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLinkInput) => createLink(input),
    onSuccess: (link) => {
      queryClient.invalidateQueries({ queryKey: linksForEntityKey(link.from_type, link.from_id) });
      queryClient.invalidateQueries({ queryKey: linksForEntityKey(link.to_type, link.to_id) });
      emit({
        type: "link.created",
        fromType: link.from_type,
        fromId: link.from_id,
        toType: link.to_type,
        toId: link.to_id,
        relType: link.rel_type,
      });
    },
  });
}
