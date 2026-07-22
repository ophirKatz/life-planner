import { router } from "expo-router";
import { Lightbulb } from "lucide-react-native";

import { IdeasWidget } from "@/modules/ideas/components/IdeasWidget";
import { listAllIdeas, resolveIdea } from "@/modules/ideas/linkable";
import type { ModuleDefinition } from "@/core/modules/types";

export const ideasModule: ModuleDefinition = {
  slug: "ideas",
  name: "Idea Log",
  icon: Lightbulb,
  tier: "pro",
  routes: [{ path: "ideas", title: "Idea Log" }],
  dashboardWidgets: [IdeasWidget],
  quickAddActions: [
    {
      id: "ideas.new",
      label: "New idea",
      icon: Lightbulb,
      onPress: () => router.push("/modules/ideas/new"),
    },
  ],
  linkableEntities: [
    { type: "idea", table: "ideas", label: "Idea", resolve: resolveIdea, listAll: listAllIdeas },
  ],
};
