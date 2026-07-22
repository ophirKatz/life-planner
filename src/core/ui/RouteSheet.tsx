import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, ScrollView } from "react-native";

import { Sheet, SheetContent } from "@/core/ui/Sheet";

/** Renders a routed "new X" / quick-action screen as a bottom-drawer sheet
 * instead of a full page. The route itself is unchanged — quickAddActions
 * and "+" buttons still `router.push` to it, so deep-linking and the
 * global quick-add sheet keep working — only its presentation changes:
 * dismissing (backdrop tap, swipe, or an explicit close) just pops the
 * route via router.back(). Pair with `presentation: "transparentModal"` and
 * `animation: "none"` on the route's Stack.Screen so only this component's
 * own slide-up animation plays. */
export function RouteSheet({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <Sheet
      open
      onOpenChange={(open) => {
        if (!open) router.back();
      }}
    >
      <SheetContent className="max-h-[85%]">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView showsVerticalScrollIndicator={false}>{children}</ScrollView>
        </KeyboardAvoidingView>
      </SheetContent>
    </Sheet>
  );
}
