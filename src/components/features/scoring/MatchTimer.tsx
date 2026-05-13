import React, { useEffect } from "react";
import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { formatDuration } from "@/utils/formatDate";

interface MatchTimerProps {
  seconds: number;
  isRunning: boolean;
}

export const MatchTimer: React.FC<MatchTimerProps> = ({ seconds, isRunning }) => {
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isRunning) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1,
        true
      );
    } else {
      opacity.value = 1;
    }
  }, [isRunning, opacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View className="items-center">
      <View className="flex-row items-center mb-1">
        {isRunning && (
          <Animated.View
            style={pulseStyle}
            className="flex-row items-center bg-primary/10 px-2 py-0.5 rounded-md mr-2"
          >
            <View className="w-1.5 h-1.5 rounded-full bg-primary mr-1" />
            <Text className="text-[10px] font-heading text-primary uppercase tracking-tighter">
              Live
            </Text>
          </Animated.View>
        )}
        {!isRunning && seconds > 0 && (
          <View className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md mr-2">
            <Text className="text-[10px] font-heading text-gray-500 uppercase tracking-tighter">
              Paused
            </Text>
          </View>
        )}
      </View>
      
      <Text className="text-4xl font-scoreboard text-black dark:text-white tabular-nums">
        {formatDuration(seconds)}
      </Text>
    </View>
  );
};
