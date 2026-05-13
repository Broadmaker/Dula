import React, { useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { checkWinCondition, calculateSnapshot } from "@/features/scoring/scoringEngine";
import { Card } from "@/components/ui/Card";
import type { Match } from "@/types/match.types";
import { formatMatchDate, formatDuration } from "@/utils/formatDate";

interface MatchCardProps {
  match: Match;
  onPress: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const teamA = match.teams[0];
  const teamB = match.teams[1];
  const scoreA = match.score[teamA.id] ?? 0;
  const scoreB = match.score[teamB.id] ?? 0;
  const isCompleted = match.status === "completed";
  const isActive = match.status === "active";

  const snapshot = calculateSnapshot(match);
  const winner = isCompleted ? checkWinCondition(snapshot, match) : null;
  const winnerId = winner?.id ?? null;

  // Pulse animation for active matches
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (isActive) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 1000 }),
          withTiming(1, { duration: 1000 }),
        ),
        -1,
        true,
      );
    } else {
      opacity.value = 1;
    }
  }, [isActive, opacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      onPress={() => onPress(match)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`${teamA.name} vs ${teamB.name}, ${scoreA} to ${scoreB}`}
    >
      <Card className="mb-4">
        {/* Header: Status and Date */}
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
            {isActive && (
              <Animated.View
                style={pulseStyle}
                className="w-2 h-2 rounded-full bg-primary mr-1.5"
              />
            )}
            <Text className="text-[10px] font-heading text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {match.status}
            </Text>
          </View>
          <Text className="text-[11px] font-body text-gray-500">
            {match.startedAt ? formatMatchDate(match.startedAt) : "Setup Phase"}
          </Text>
        </View>

        {/* Teams and Score */}
        <View className="flex-row items-center justify-between py-1">
          {/* Team A */}
          <View className="flex-1 items-start">
            <Text
              className={`text-base font-heading ${
                winnerId === teamA.id
                  ? "text-primary"
                  : "text-black dark:text-white"
              }`}
              numberOfLines={1}
            >
              {teamA.name}
            </Text>
            {winnerId === teamA.id && (
              <Text className="text-[10px] font-heading text-primary uppercase">
                Winner
              </Text>
            )}
          </View>

          {/* Score Center */}
          <View className="px-3 flex-row items-center">
            <Text
              className={`text-2xl font-scoreboard ${
                winnerId === teamA.id
                  ? "text-primary"
                  : "text-black dark:text-white"
              }`}
            >
              {scoreA}
            </Text>
            <Text className="text-xl font-scoreboard text-gray-300 dark:text-gray-700 mx-2">
              -
            </Text>
            <Text
              className={`text-2xl font-scoreboard ${
                winnerId === teamB.id
                  ? "text-primary"
                  : "text-black dark:text-white"
              }`}
            >
              {scoreB}
            </Text>
          </View>

          {/* Team B */}
          <View className="flex-1 items-end">
            <Text
              className={`text-base font-heading ${
                winnerId === teamB.id
                  ? "text-primary"
                  : "text-black dark:text-white"
              }`}
              numberOfLines={1}
            >
              {teamB.name}
            </Text>
            {winnerId === teamB.id && (
              <Text className="text-[10px] font-heading text-primary uppercase text-right">
                Winner
              </Text>
            )}
          </View>
        </View>

        {/* Footer: Meta Info */}
        <View className="mt-4 pt-3 border-t border-gray-50 dark:border-gray-800/50 flex-row justify-between items-center">
          <Text className="text-[11px] font-body text-gray-400 capitalize">
            {match.type} {"\u00B7"} {match.scoreLimit} pts
          </Text>
          {match.durationSeconds ? (
            <Text className="text-[11px] font-body text-gray-400">
              Duration: {formatDuration(match.durationSeconds)}
            </Text>
          ) : null}
        </View>
      </Card>
    </TouchableOpacity>
  );
};
