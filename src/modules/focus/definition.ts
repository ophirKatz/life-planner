import { Zap } from "lucide-react-native";

import { FocusWidget } from "@/modules/focus/components/FocusWidget";
import type { ModuleDefinition } from "@/core/modules/types";

export const focusModule: ModuleDefinition = {
  slug: "focus",
  name: "Focus",
  icon: Zap,
  tier: "pro",
  routes: [{ path: "focus", title: "Focus" }],
  dashboardWidgets: [FocusWidget],
  quickAddActions: [],
  linkableEntities: [],
};
