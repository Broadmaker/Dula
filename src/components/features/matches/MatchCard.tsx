import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/Card";
import { Match } from "@/types/match.types";
import { formatMatchDate } from "@/utils/formatDate";

interface MatchCardProps {
  match: Match;
  onPress?: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const teamA = match.teams[0];
  const teamB = match.teams[1];
  const scoreA = match.score[teamA.id] || 0;
  const scoreB = match.score[teamB.id] || 0;

  const isCompleted = match.status === "completed";
  const winnerId = isCompleted ? (scoreA > scoreB ? teamA.id : teamB.id) : null;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => onPress?.(match)}
      className="mb-4"
    >
      <Card className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-1">
            <View
              className={`w-2 h-2 rounded-full mr-2 ${
                match.status === "active" ? "bg-secondary" : "bg-gray-400"
              }`}
            />
            <Text className="text-xs font-body text-gray-500 uppercase tracking-widest">
              {match.type} • {formatMatchDate(match.created_at)}
            </Text>
          </View>

          <View className="flex-row items-center justify-between mt-2">
            <View className="flex-1 pr-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text
                  className={`text-lg font-heading flex-1 ${
                    winnerId === teamA.id ? "text-primary" : "text-black dark:text-white"
                  }`}
                  numberOfLines={1}
                >
                  {teamA.name}
                </Text>
                <Text className="text-2xl font-scoreboard text-black dark:text-white ml-4">
                  {scoreA}
                </Text>
              </View>

              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-lg font-heading flex-1 ${
                    winnerId === teamB.id ? "text-primary" : "text-black dark:text-white"
                  }`}
                  numberOfLines={1}
                >
                  {teamB.name}
                </Text>
                <Text className="text-2xl font-scoreboard text-black dark:text-white ml-4">
                  {scoreB}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {isCompleted && (
          <View className="bg-primary/10 px-2 py-1 rounded ml-2">
            <Text className="text-primary font-heading text-[10px] uppercase">
              Final
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};
