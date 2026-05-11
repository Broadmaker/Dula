import React from "react";
import { View, Text } from "react-native";
import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  message?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  message,
  icon,
  actionLabel,
  onAction,
}) => {
  return (
    <View className="flex-1 justify-center items-center p-8">
      {icon && <View className="mb-4">{icon}</View>}
      <Text className="text-xl font-heading text-center text-black dark:text-white mb-2">
        {title}
      </Text>
      {message && (
        <Text className="text-base font-body text-center text-gray-500 dark:text-gray-400 mb-6">
          {message}
        </Text>
      )}
      {actionLabel && onAction && (
        <Button onPress={onAction}>{actionLabel}</Button>
      )}
    </View>
  );
};
