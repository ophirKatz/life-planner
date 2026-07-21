import { router } from "expo-router";
import { Users } from "lucide-react-native";

import { PeopleWidget } from "@/modules/people/components/PeopleWidget";
import { listAllPeople, resolvePerson } from "@/modules/people/linkable";
import type { ModuleDefinition } from "@/core/modules/types";

export const peopleModule: ModuleDefinition = {
  slug: "people",
  name: "People",
  icon: Users,
  tier: "free",
  routes: [{ path: "people", title: "People" }],
  dashboardWidgets: [PeopleWidget],
  quickAddActions: [
    {
      id: "people.new",
      label: "New contact",
      icon: Users,
      onPress: () => router.push("/modules/people/new"),
    },
  ],
  linkableEntities: [
    { type: "person", table: "people", label: "Person", resolve: resolvePerson, listAll: listAllPeople },
  ],
};
