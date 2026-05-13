import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp, CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";

import type { MatchStackParamList, MainTabParamList } from "@/navigation/types";
import { matchDb } from "@/services/db/matchDb";
import { checkWinCondition, calculateSnapshot } from "@/features/scoring/scoringEngine";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Match } from "@/types/match.types";
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
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-[#121212] p-4">
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
  const scoreA = match.score[teamA.id] ?? 0;
  const scoreB = match.score[teamB.id] ?? 0;

  const snapshot = calculateSnapshot(match);
  const winner = checkWinCondition(snapshot, match);
  const isDraw = !winner;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Celebration Header */}
        <View className="items-center mb-10 mt-6">
          <View className="bg-primary/10 dark:bg-primary/20 px-4 py-1 rounded-full mb-4">
            <Text className="text-primary font-heading uppercase tracking-[2px] text-[10px]">
              Match Completed
            </Text>
          </View>
          <Text className="text-5xl font-heading text-black dark:text-white text-center leading-tight">
            {isDraw ? "Well Played!" : `${winner?.name}\nWins!`}
          </Text>
          <Text className="text-sm font-body text-gray-400 mt-2">
            {match.completedAt ? formatMatchDate(match.completedAt) : formatMatchDate(match.created_at)}
          </Text>
        </View>

        {/* High-Impact Scoreboard */}
        <Card className="mb-8 py-10 shadow-xl border border-gray-50 dark:border-gray-800">
          <View className="flex-row items-center justify-center">
            <View className="items-center flex-1 px-2">
              <Text className="text-[10px] font-heading text-gray-400 uppercase tracking-widest mb-3 text-center" numberOfLines={1}>
                {teamA.name}
              </Text>
              <Text className={`text-7xl font-scoreboard ${winner?.id === teamA.id ? 'text-primary' : 'text-black dark:text-white'}`}>
                {scoreA}
              </Text>
            </View>
            
            <View className="px-6">
              <Text className="text-3xl font-scoreboard text-gray-200 dark:text-gray-800">·</Text>
            </View>

            <View className="items-center flex-1 px-2">
              <Text className="text-[10px] font-heading text-gray-400 uppercase tracking-widest mb-3 text-center" numberOfLines={1}>
                {teamB.name}
              </Text>
              <Text className={`text-7xl font-scoreboard ${winner?.id === teamB.id ? 'text-primary' : 'text-black dark:text-white'}`}>
                {scoreB}
              </Text>
            </View>
          </View>
        </Card>

        {/* Match Breakdown Stats */}
        <Text className="text-xs font-heading text-gray-400 uppercase tracking-widest mb-4 ml-1">
          Match Breakdown
        </Text>
        
        <View className="flex-row flex-wrap justify-between">
          <StatBox 
            label="Duration" 
            value={formatDuration(match.durationSeconds || 0)} 
          />
          <StatBox 
            label="Rallies" 
            value={match.events.length.toString()} 
          />
          <StatBox 
            label="Format" 
            value={match.type.charAt(0).toUpperCase() + match.type.slice(1)} 
          />
          <StatBox 
            label="Points" 
            value={(scoreA + scoreB).toString()} 
          />
        </View>

        {/* Primary Actions */}
        <View className="mt-12">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onPress={() => navigation.navigate("ShareCard", { matchId })}
          >
            Create Share Card
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            className="w-full mt-4"
            onPress={() => navigation.navigate("HistoryTab", { screen: "MatchHistory" })}
          >
            View History
          </Button>

          <Button
            variant="secondary"
            size="md"
            className="w-full mt-6 border-transparent"
            onPress={() => navigation.navigate("HomeTab", { screen: "Dashboard" })}
          >
            Back to Dashboard
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-[48%] mb-4">
      <Card className="items-center justify-center py-6 border border-gray-50 dark:border-gray-800/50">
        <Text className="text-[9px] font-heading text-gray-400 uppercase tracking-tighter mb-1">
          {label}
        </Text>
        <Text className="text-xl font-scoreboard text-black dark:text-white">
          {value}
        </Text>
      </Card>
    </View>
  );
}
