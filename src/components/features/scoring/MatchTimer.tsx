import React from "react";
import { View, Text } from "react-native";
import { formatDuration } from "@/utils/formatDate";

interface MatchTimerProps {
  seconds: number;
  isRunning: boolean;
}

export const MatchTimer: React.FC<MatchTimerProps> = ({ seconds, isRunning }) => {
  return (
    <View className="flex-row items-center justify-center py-2 px-4 rounded-full bg-gray-100 dark:bg-gray-800">
      <View
        className={`w-2 h-2 rounded-full mr-2 ${
          isRunning ? "bg-primary" : "bg-gray-400"
        }`}
      />
      <Text className="text-lg font-scoreboard text-black dark:text-white">
        {formatDuration(seconds)}
      </Text>
    </View>
  );
};
