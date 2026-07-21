import { Component, type ReactNode } from "react";
import { Text, View } from "react-native";

import { Button } from "@/core/ui/Button";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/** Last-resort fallback so a render error shows a recoverable screen instead
 * of a blank/crashed one (DESIGN.md §M8 "no blank/janky screens"). */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View className="flex-1 bg-bg items-center justify-center px-8 gap-4">
          <Text className="text-lg font-semibold text-foreground text-center">
            Something went wrong
          </Text>
          <Text className="text-sm text-muted-foreground text-center">
            {this.state.error.message}
          </Text>
          <Button label="Try again" onPress={() => this.setState({ error: null })} />
        </View>
      );
    }
    return this.props.children;
  }
}
