import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, SafeAreaView, Alert } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp, CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";

import type { HistoryStackParamList, MainTabParamList } from "@/navigation/types";
import { matchDb } from "@/services/db/matchDb";
import { checkWinCondition, calculateSnapshot } from "@/features/scoring/scoringEngine";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Match } from "@/types/match.types";
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

  const loadMatch = useCallback(async () => {
    try {
      const data = await matchDb(db).getMatchByUuid(matchId);
      // Don't show soft-deleted matches
      if (data?.sync_status === "deleted") {
        setMatch(null);
      } else {
        setMatch(data);
      }
    } catch (error) {
      logger.error("Failed to load match detail", error);
    } finally {
      setIsLoading(false);
    }
  }, [matchId, db]);

  useEffect(() => {
    loadMatch();
  }, [loadMatch]);

  const handleDeleteMatch = async () => {
    Alert.alert(
      "Delete Match",
      "Are you sure you want to remove this match record? This action will hide the match from your history.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await matchDb(db).deleteMatch(matchId);
              navigation.goBack();
            } catch (error) {
              logger.error("Failed to delete match", error);
              Alert.alert("Error", "Could not delete the match record.");
            }
          },
        },
      ]
    );
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!match) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-[#121212] p-4">
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
  const scoreA = match.score[teamA.id] ?? 0;
  const scoreB = match.score[teamB.id] ?? 0;

  const snapshot = calculateSnapshot(match);
  const winner = checkWinCondition(snapshot, match);
  const isDraw = !winner;

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Header */}
        <View className="items-center mb-10 mt-6">
          <View className="bg-gray-100 dark:bg-gray-800 px-4 py-1 rounded-full mb-4">
            <Text className="text-gray-500 font-heading uppercase tracking-widest text-[10px]">
              {match.status === "active" ? "In Progress" : "Final Result"}
            </Text>
          </View>
          <Text className="text-4xl font-heading text-black dark:text-white text-center">
            {isDraw ? "Well Played!" : `${winner?.name}\nWon`}
          </Text>
          <Text className="text-sm font-body text-gray-400 mt-2">
            {formatMatchDate(match.completedAt || match.created_at)}
          </Text>
        </View>

        {/* Final Score Card */}
        <Card className="mb-8 py-8 border border-gray-50 dark:border-gray-800 shadow-sm">
          <View className="flex-row items-center justify-around">
            <View className="items-center flex-1">
              <Text className="text-[10px] font-heading text-gray-400 uppercase tracking-widest mb-3 text-center" numberOfLines={1}>
                {teamA.name}
              </Text>
              <Text className={`text-6xl font-scoreboard ${winner?.id === teamA.id ? 'text-primary' : 'text-black dark:text-white'}`}>
                {scoreA}
              </Text>
            </View>
            
            <View className="px-4">
              <Text className="text-2xl font-scoreboard text-gray-200 dark:text-gray-800">·</Text>
            </View>

            <View className="items-center flex-1">
              <Text className="text-[10px] font-heading text-gray-400 uppercase tracking-widest mb-3 text-center" numberOfLines={1}>
                {teamB.name}
              </Text>
              <Text className={`text-6xl font-scoreboard ${winner?.id === teamB.id ? 'text-primary' : 'text-black dark:text-white'}`}>
                {scoreB}
              </Text>
            </View>
          </View>
        </Card>

        {/* Stats Grid */}
        <View className="flex-row flex-wrap justify-between mb-8">
          <DetailStatBox label="Duration" value={formatDuration(match.durationSeconds || 0)} />
          <DetailStatBox label="Rallies" value={match.events.length.toString()} />
          <DetailStatBox label="Format" value={match.type} />
          <DetailStatBox label="Limit" value={`${match.scoreLimit} pts`} />
        </View>

        {/* Event Log (Simplified for Phase 1) */}
        {match.events.length > 0 && (
          <View className="mb-10">
            <Text className="text-xs font-heading text-gray-400 uppercase tracking-widest mb-4 ml-1">
              Match Timeline
            </Text>
            <Card className="p-0 overflow-hidden border border-gray-50 dark:border-gray-800">
              {match.events.slice(-5).reverse().map((event, index) => (
                <View 
                  key={event.eventId} 
                  className={`flex-row items-center p-4 ${index !== 0 ? 'border-t border-gray-50 dark:border-gray-800' : ''}`}
                >
                  <View className={`w-2 h-2 rounded-full mr-4 ${event.type === 'POINT' ? 'bg-primary' : event.type === 'TIMEOUT' ? 'bg-secondary' : 'bg-error'}`} />
                  <View className="flex-1">
                    <Text className="text-xs font-heading text-black dark:text-white uppercase">
                      {event.type}
                    </Text>
                    <Text className="text-[10px] font-body text-gray-400">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </Text>
                  </View>
                </View>
              ))}
              {match.events.length > 5 && (
                <View className="p-3 bg-gray-50 dark:bg-gray-900/50 items-center">
                  <Text className="text-[10px] font-body text-gray-400">
                    Showing last 5 of {match.events.length} events
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Actions */}
        <View className="mt-4">
          <Button
            variant="primary"
            size="lg"
            className="mb-4"
            onPress={() => {
              navigation.navigate("MatchTab", {
                screen: "ShareCard",
                params: { matchId: match.uuid }
              });
            }}
          >
            Reshare Result
          </Button>

          {match.status === "active" && (
            <Button
              variant="secondary"
              size="lg"
              className="mb-4"
              onPress={() => {
                navigation.navigate("MatchTab", {
                  screen: "LiveScoring",
                  params: { matchId: match.uuid }
                });
              }}
            >
              Resume Match
            </Button>
          )}

          <Button
            variant="ghost"
            size="lg"
            className="mb-6"
            onPress={() => navigation.goBack()}
          >
            Back to History
          </Button>

          <View className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <Button
              variant="error"
              size="md"
              className="bg-transparent border border-error/20"
              onPress={handleDeleteMatch}
            >
              Delete Match Record
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function DetailStatBox({ label, value }: { label: string; value: string }) {
  return (
    <View className="w-[48%] mb-4">
      <Card className="items-center justify-center py-6 border border-gray-50 dark:border-gray-800/50">
        <Text className="text-[9px] font-heading text-gray-400 uppercase tracking-tighter mb-1">
          {label}
        </Text>
        <Text className="text-base font-scoreboard text-black dark:text-white capitalize">
          {value}
        </Text>
      </Card>
    </View>
  );
}
