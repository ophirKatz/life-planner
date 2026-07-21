import { Text, View } from "react-native";

// Replaced by the Calendar module's screens in M3/M4.
export default function CalendarPlaceholderScreen() {
  return (
    <View className="flex-1 bg-bg items-center justify-center px-8">
      <Text className="text-base text-muted-foreground text-center">
        Enable the Calendar module from the Store to get started.
      </Text>
    </View>
  );
}
