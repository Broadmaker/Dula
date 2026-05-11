import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp, CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";

import type { HistoryStackParamList, MainTabParamList } from "@/navigation/types";
import { matchDb } from "@/services/db/matchDb";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Match } from "@/types/match.types";
import { formatDuration, formatMatchDate } from "@/utils/formatDate";
import { logger } from "@/utils/logger";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HistoryStackParamList, "MatchDetail">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function MatchDetailScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<HistoryStackParamList, "MatchDetail">>();
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
        logger.error("Failed to load match detail", error);
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
          onPress={() => navigation.goBack()}
        >
          Go Back
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
        {/* Header */}
        <View className="items-center mb-8 mt-4">
          <View className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-full mb-2">
            <Text className="text-gray-500 font-heading uppercase tracking-widest text-[10px]">
              {match.status === "active" ? "Active Match" : "Match Result"}
            </Text>
          </View>
          <Text className="text-3xl font-heading text-black dark:text-white text-center">
            {isDraw ? "Draw Match" : `${winner.name} Won`}
          </Text>
          <Text className="text-sm font-body text-gray-500 mt-1">
            {formatMatchDate(match.created_at)}
          </Text>
        </View>

        {/* Final Score Card */}
        <Card className="mb-6 py-6">
          <View className="flex-row items-center justify-around">
            <View className="items-center flex-1">
              <Text className="text-xs font-heading text-gray-400 uppercase mb-2 text-center" numberOfLines={1}>
                {teamA.name}
              </Text>
              <Text className="text-5xl font-scoreboard text-black dark:text-white">
                {scoreA}
              </Text>
            </View>
            
            <View className="px-2">
              <Text className="text-xl font-scoreboard text-gray-200">VS</Text>
            </View>

            <View className="items-center flex-1">
              <Text className="text-xs font-heading text-gray-400 uppercase mb-2 text-center" numberOfLines={1}>
                {teamB.name}
              </Text>
              <Text className="text-5xl font-scoreboard text-black dark:text-white">
                {scoreB}
              </Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <DetailStatBox label="Duration" value={formatDuration(match.durationSeconds || 0)} />
          <DetailStatBox label="Type" value={match.type} />
          <DetailStatBox label="Limit" value={match.scoreLimit.toString()} />
          <DetailStatBox label="Status" value={match.status} />
        </View>

        {/* Actions */}
        <View className="gap-y-4">
          <Button
            variant="primary"
            onPress={() => {
              // Note: MatchTab is a sibling tab, but ShareCard is in MatchStack.
              // To go there we must navigate to MatchTab -> ShareCard
              navigation.navigate("MatchTab", {
                screen: "ShareCard",
                params: { matchId: match.uuid }
              });
            }}
          >
            Reshare Match
          </Button>

          {match.status === "active" && (
            <Button
              variant="secondary"
              onPress={() => {
                navigation.navigate("MatchTab", {
                  screen: "LiveScoring",
                  params: { matchId: match.uuid }
                });
              }}
            >
              Resume Scoring
            </Button>
          )}

          <Button
            variant="ghost"
            onPress={() => navigation.goBack()}
          >
            Back to History
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailStatBox({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-[48%] mb-4">
      <Card className="items-center justify-center py-4 bg-gray-50 dark:bg-gray-900/50">
        <Text className="text-[9px] font-heading text-gray-400 uppercase mb-1">
          {label}
        </Text>
        <Text className="text-base font-scoreboard text-black dark:text-white capitalize">
          {value}
        </Text>
      </Card>
    </View>
  );
}
