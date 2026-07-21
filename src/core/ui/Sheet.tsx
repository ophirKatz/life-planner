import * as DialogPrimitive from "@rn-primitives/dialog";
import { MotiView } from "moti";
import { View } from "react-native";

import { cn } from "@/core/ui/lib/utils";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

export function SheetContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="absolute inset-0 justify-end bg-black/50">
        <MotiView
          from={{ translateY: 400 }}
          animate={{ translateY: 0 }}
          transition={{ type: "timing", duration: 220 }}
        >
          <DialogPrimitive.Content
            className={cn(
              "w-full gap-4 rounded-t-3xl bg-surface p-6 pb-10",
              className
            )}
            {...props}
          >
            <View className="self-center h-1.5 w-10 rounded-full bg-border mb-1" />
            {children}
          </DialogPrimitive.Content>
        </MotiView>
      </DialogPrimitive.Overlay>
    </DialogPrimitive.Portal>
  );
}
