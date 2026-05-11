import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp, CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";

import type { MatchStackParamList, MainTabParamList } from "@/navigation/types";
import { matchDb } from "@/services/db/matchDb";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Match } from "@/types/match.types";
import { formatDuration, formatMatchDate } from "@/utils/formatDate";
import { logger } from "@/utils/logger";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MatchStackParamList, "MatchSummary">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function MatchSummaryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MatchStackParamList, "MatchSummary">>();
  const db = useSQLiteContext();

  const { matchId } = route.params;
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMatch() {
      try {
        const data = await matchDb(db).getMatchByUuid(matchId);
        setMatch(data);
      } catch (error) {
        logger.error("Failed to load match summary", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMatch();
  }, [matchId, db]);

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!match) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-background-dark p-4">
        <Text className="text-xl font-heading text-error">Match not found</Text>
        <Button
          className="mt-6"
          onPress={() => navigation.navigate("HomeTab", { screen: "Dashboard" })}
        >
          Go to Dashboard
        </Button>
      </SafeAreaView>
    );
  }

  const teamA = match.teams[0];
  const teamB = match.teams[1];
  const scoreA = match.score[teamA.id] || 0;
  const scoreB = match.score[teamB.id] || 0;

  const winner = scoreA > scoreB ? teamA : teamB;
  const isDraw = scoreA === scoreB;

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Winner Banner */}
        <View className="items-center mb-8 mt-4">
          <View className="bg-primary/10 px-4 py-2 rounded-full mb-2">
            <Text className="text-primary font-heading uppercase tracking-widest text-xs">
              Match Completed
            </Text>
          </View>
          <Text className="text-4xl font-heading text-black dark:text-white text-center">
            {isDraw ? "It's a Draw!" : `${winner.name} Wins!`}
          </Text>
          <Text className="text-sm font-body text-gray-500 mt-1">
            {formatMatchDate(match.created_at)}
          </Text>
        </View>

        {/* Final Score Card */}
        <Card className="mb-6 py-8">
          <View className="flex-row items-center justify-around">
            <View className="items-center flex-1">
              <Text className="text-sm font-heading text-gray-500 uppercase mb-2 text-center" numberOfLines={1}>
                {teamA.name}
              </Text>
              <Text className="text-6xl font-scoreboard text-black dark:text-white">
                {scoreA}
              </Text>
            </View>
            
            <View className="px-4">
              <Text className="text-2xl font-scoreboard text-gray-300">—</Text>
            </View>

            <View className="items-center flex-1">
              <Text className="text-sm font-heading text-gray-500 uppercase mb-2 text-center" numberOfLines={1}>
                {teamB.name}
              </Text>
              <Text className="text-6xl font-scoreboard text-black dark:text-white">
                {scoreB}
              </Text>
            </View>
          </View>
        </Card>

        {/* Match Stats */}
        <Text className="text-lg font-heading text-black dark:text-white mb-4 ml-1">
          Match Stats
        </Text>
        
        <View className="flex-row flex-wrap justify-between">
          <StatBox 
            label="Duration" 
            value={formatDuration(match.durationSeconds || 0)} 
          />
          <StatBox 
            label="Total Points" 
            value={(scoreA + scoreB).toString()} 
          />
          <StatBox 
            label="Match Type" 
            value={match.type.charAt(0).toUpperCase() + match.type.slice(1)} 
          />
          <StatBox 
            label="Score Limit" 
            value={match.scoreLimit.toString()} 
          />
        </View>

        {/* Actions */}
        <View className="mt-10">
          <Button
            variant="secondary"
            size="lg"
            className="mb-4"
            onPress={() => navigation.navigate("ShareCard", { matchId })}
          >
            Share Result
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onPress={() => navigation.navigate("HomeTab", { screen: "Dashboard" })}
          >
            Done
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-[48%] mb-4">
      <Card className="items-center justify-center py-4">
        <Text className="text-[10px] font-heading text-gray-400 uppercase mb-1">
          {label}
        </Text>
        <Text className="text-lg font-scoreboard text-black dark:text-white">
          {value}
        </Text>
      </Card>
    </View>
  );
}
