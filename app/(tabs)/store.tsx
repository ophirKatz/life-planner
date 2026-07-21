import { Text, View } from "react-native";

// Replaced by the module marketplace UI in M1/M3.
export default function StorePlaceholderScreen() {
  return (
    <View className="flex-1 bg-bg items-center justify-center px-8">
      <Text className="text-base text-muted-foreground text-center">
        The module store is coming soon.
      </Text>
    </View>
  );
}
