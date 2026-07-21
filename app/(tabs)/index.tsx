import { Text, View } from "react-native";

// Real dashboard widget composition arrives in M4. For now this is the
// "empty Home" M0 requires: authed users land here with nothing to show yet.
export default function HomeScreen() {
  return (
    <View className="flex-1 bg-bg items-center justify-center px-8">
      <Text className="text-xl font-semibold text-foreground mb-2">Your dashboard is empty</Text>
      <Text className="text-base text-muted-foreground text-center">
        Enable modules from the Store to see them here.
      </Text>
    </View>
  );
}
