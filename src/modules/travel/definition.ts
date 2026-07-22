import { router } from "expo-router";
import { Plane } from "lucide-react-native";

import { TripsWidget } from "@/modules/travel/components/TripsWidget";
import { listAllTrips, resolveTrip } from "@/modules/travel/linkable";
import type { ModuleDefinition } from "@/core/modules/types";

export const travelModule: ModuleDefinition = {
  slug: "travel",
  name: "Travel",
  icon: Plane,
  tier: "pro",
  routes: [{ path: "travel", title: "Travel" }],
  dashboardWidgets: [TripsWidget],
  quickAddActions: [
    {
      id: "travel.new",
      label: "New trip",
      icon: Plane,
      onPress: () => router.push("/modules/travel/new"),
    },
  ],
  linkableEntities: [
    { type: "trip", table: "trips", label: "Trip", resolve: resolveTrip, listAll: listAllTrips },
  ],
};
