import { Text, View } from "react-native";

// Replaced by the global quick-add sheet (aggregating module quickAddActions) in M2.
export default function AddPlaceholderScreen() {
  return (
    <View className="flex-1 bg-bg items-center justify-center px-8">
      <Text className="text-base text-muted-foreground text-center">
        Quick-add will appear here once modules are installed.
      </Text>
    </View>
  );
}
