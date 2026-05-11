import React from "react";
import { View, ActivityIndicator, Text } from "react-native";
import { colors } from "@/constants/theme";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  fullScreen?: boolean;
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  color = colors.primary,
  fullScreen = false,
  message,
}) => {
  if (fullScreen) {
    return (
      <View className="flex-1 justify-center items-center bg-white dark:bg-[#121212]">
        <ActivityIndicator size={size} color={color} />
        {message && (
          <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {message}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View className="p-4 justify-center items-center">
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {message}
        </Text>
      )}
    </View>
  );
};
