import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { useGoogleSignIn } from "@/core/auth/useGoogleSignIn";

export default function LoginScreen() {
  const { signInWithGoogle, isSigningIn, error } = useGoogleSignIn();

  return (
    <View className="flex-1 bg-bg items-center justify-center px-8">
      <View className="items-center gap-2 mb-16">
        <Text className="text-3xl font-semibold text-foreground">Life Planner</Text>
        <Text className="text-base text-muted-foreground text-center">
          Compose your day from the modules you actually use.
        </Text>
      </View>

      <Pressable
        onPress={signInWithGoogle}
        disabled={isSigningIn}
        accessibilityRole="button"
        accessibilityLabel="Continue with Google"
        className="w-full max-w-xs flex-row items-center justify-center gap-2 rounded-2xl bg-accent px-6 py-4 active:opacity-80 disabled:opacity-60"
      >
        {isSigningIn ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-accent-foreground text-base font-medium">Continue with Google</Text>
        )}
      </Pressable>

      {error ? (
        <Text className="mt-4 text-sm text-danger text-center max-w-xs">{error}</Text>
      ) : null}
    </View>
  );
}
