import {
  Bookmark,
  Calendar,
  ChefHat,
  Flame,
  Lightbulb,
  ListTodo,
  Mountain,
  Package,
  ShoppingCart,
  Sparkles,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react-native";

// Maps `modules.icon` (a stable string in the DB) to its Lucide component.
// The Store screen renders straight from the catalog table, so this mapping
// has to exist independent of any module's own (not-yet-installed) registry entry.
const iconMap: Record<string, LucideIcon> = {
  "list-todo": ListTodo,
  calendar: Calendar,
  users: Users,
  flame: Flame,
  "shopping-cart": ShoppingCart,
  sparkles: Sparkles,
  lightbulb: Lightbulb,
  bookmark: Bookmark,
  zap: Zap,
  "chef-hat": ChefHat,
  mountain: Mountain,
};

export function getModuleIcon(icon: string): LucideIcon {
  return iconMap[icon] ?? Package;
}
