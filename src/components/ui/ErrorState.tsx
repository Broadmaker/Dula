import React from "react";
import { View, Text } from "react-native";
import { Button } from "./Button";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Something went wrong",
  message,
  onRetry,
}) => {
  return (
    <View className="flex-1 justify-center items-center p-8">
      <View className="bg-error/10 p-4 rounded-full mb-4">
        {/* You could add an error icon here */}
      </View>
      <Text className="text-xl font-heading text-center text-error mb-2">
        {title}
      </Text>
      <Text className="text-base font-body text-center text-gray-500 dark:text-gray-400 mb-6">
        {message}
      </Text>
      {onRetry && <Button variant="primary" onPress={onRetry}>Retry</Button>}
    </View>
  );
};
