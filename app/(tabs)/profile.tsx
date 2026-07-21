import { Pressable, Text, View } from "react-native";

import { useSession } from "@/core/auth/session";

export default function ProfileScreen() {
  const { session, signOut } = useSession();

  return (
    <View className="flex-1 bg-bg px-8 pt-20">
      <Text className="text-xl font-semibold text-foreground mb-1">Profile</Text>
      <Text className="text-base text-muted-foreground mb-10">{session?.user.email}</Text>

      <Pressable
        onPress={signOut}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        className="rounded-2xl bg-surface-muted px-6 py-4 items-center active:opacity-80"
      >
        <Text className="text-base font-medium text-danger">Sign out</Text>
      </Pressable>
    </View>
  );
}
