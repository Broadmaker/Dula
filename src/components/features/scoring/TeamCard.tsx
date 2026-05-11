import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Card } from "@/components/ui/Card";
import { Team } from "@/types/match.types";

interface TeamCardProps {
  team: Team;
  score: number;
  isServing: boolean;
  serverNumber?: number;
  onPress: () => void;
  onLongPress?: () => void;
  side: "left" | "right";
}

export const TeamCard: React.FC<TeamCardProps> = ({
  team,
  score,
  isServing,
  serverNumber,
  onPress,
  onLongPress,
  side,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      onLongPress={onLongPress}
      className={`flex-1 ${side === "left" ? "mr-2" : "ml-2"}`}
    >
      <Card
        className={`h-64 items-center justify-center border-4 ${
          isServing ? "border-secondary shadow-lg" : "border-transparent"
        }`}
      >
        <Text
          className="text-base font-heading text-gray-500 dark:text-gray-400 mb-2 uppercase text-center"
          numberOfLines={1}
        >
          {team.name}
        </Text>
        <Text className="text-8xl font-scoreboard text-black dark:text-white">
          {score}
        </Text>
        {isServing && serverNumber && (
          <View className="absolute bottom-4 right-4 bg-secondary rounded-full w-10 h-10 items-center justify-center">
            <Text className="text-white font-heading text-xl">
              {serverNumber}
            </Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
};
