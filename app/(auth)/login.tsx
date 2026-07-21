import { Text, View } from "react-native";

import { useGoogleSignIn } from "@/core/auth/useGoogleSignIn";
import { Button } from "@/core/ui/Button";

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

      <Button
        label="Continue with Google"
        onPress={signInWithGoogle}
        isLoading={isSigningIn}
        size="lg"
        className="w-full max-w-xs"
        accessibilityLabel="Continue with Google"
      />

      {error ? (
        <Text className="mt-4 text-sm text-danger text-center max-w-xs">{error}</Text>
      ) : null}
    </View>
  );
}
