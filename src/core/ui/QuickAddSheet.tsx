import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";

import { useQuickAddActions } from "@/core/modules/hooks";
import { EmptyState } from "@/core/ui/EmptyState";
import { ListItem } from "@/core/ui/ListItem";
import { Sheet, SheetContent } from "@/core/ui/Sheet";
import { useQuickAddStore } from "@/core/ui/quick-add-store";

/** Aggregates every enabled module's quickAddActions behind the "+" tab. */
export function QuickAddSheet() {
  const { isOpen, close, open } = useQuickAddStore();
  const actions = useQuickAddActions();

  return (
    <Sheet open={isOpen} onOpenChange={(next) => (next ? open() : close())}>
      <SheetContent>
        <Text className="text-lg font-semibold text-foreground text-center mb-1">Quick add</Text>

        {actions.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nothing to add yet"
            description="Enable a module from the Store to see its quick-add actions here."
          />
        ) : (
          <View className="gap-2">
            {actions.map((action) => (
              <ListItem
                key={action.id}
                title={action.label}
                icon={action.icon}
                onPress={() => {
                  close();
                  action.onPress();
                }}
              />
            ))}
          </View>
        )}
      </SheetContent>
    </Sheet>
  );
}
