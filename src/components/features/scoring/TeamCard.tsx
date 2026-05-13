import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/Card";
import type { Team } from "@/types/match.types";

interface TeamCardProps {
  team: Team;
  score: number;
  isServing: boolean;
  serverNumber?: number; // ← was 1 | 2
  side: "left" | "right";
  onPress: () => void;
  onLongPress: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  score,
  isServing,
  serverNumber,
  side,
  onPress,
  onLongPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      onLongPress={onLongPress}
      className={`flex-1 ${side === "left" ? "mr-2" : "ml-2"}`}
    >
      <Card
        className={`h-full min-h-[280px] items-center justify-between py-8 border-2 ${
          isServing
            ? "border-secondary bg-secondary/5 dark:bg-secondary/10 shadow-md"
            : "border-transparent bg-white dark:bg-surface"
        }`}
      >
        {/* Serving Indicator Top */}
        <View className="h-6 justify-center">
          {isServing && (
            <View className="bg-secondary px-3 py-0.5 rounded-full">
              <Text className="text-[10px] font-heading text-white uppercase tracking-widest">
                Serving
              </Text>
            </View>
          )}
        </View>

        {/* Team Name */}
        <Text
          className={`text-sm font-heading uppercase tracking-tight text-center px-2 ${
            isServing ? "text-secondary" : "text-gray-400 dark:text-gray-500"
          }`}
          numberOfLines={2}
        >
          {team.name}
        </Text>

        {/* Score */}
        <View className="items-center justify-center">
          <Text
            className={`text-9xl font-scoreboard leading-none ${
              isServing ? "text-secondary" : "text-black dark:text-white"
            }`}
          >
            {score}
          </Text>
        </View>

        {/* Server Number Badge */}
        <View className="h-10 items-center justify-center">
          {isServing && serverNumber && (
            <View className="flex-row items-center bg-secondary/20 dark:bg-secondary/30 px-3 py-1 rounded-lg">
              <Text className="text-[10px] font-heading text-secondary uppercase mr-2">
                Server
              </Text>
              <View className="bg-secondary w-5 h-5 rounded flex items-center justify-center">
                <Text className="text-white font-heading text-xs">
                  {serverNumber}
                </Text>
              </View>
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
};
