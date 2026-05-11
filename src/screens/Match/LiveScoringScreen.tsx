import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Alert, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp, CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";
import * as Haptics from "expo-haptics";

import type { MatchStackParamList, MainTabParamList } from "@/navigation/types";
import { useActiveMatchStore } from "@/store/activeMatchStore";
import { matchDb } from "@/services/db/matchDb";
import * as scoringEngine from "@/features/scoring/scoringEngine";
import { TeamCard } from "@/components/features/scoring/TeamCard";
import { MatchTimer } from "@/components/features/scoring/MatchTimer";
import { ActionBar } from "@/components/features/scoring/ActionBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import { Match } from "@/types/match.types";
import { logger } from "@/utils/logger";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MatchStackParamList, "LiveScoring">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function LiveScoringScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MatchStackParamList, "LiveScoring">>();
  const db = useSQLiteContext();

  const activeMatch = useActiveMatchStore();
  const [match, setMatchData] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const matchId = route.params?.matchId;

  // 1. Initial Load & Store Sync
  useEffect(() => {
    async function loadMatch() {
      if (!matchId) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await matchDb(db).getMatchByUuid(matchId);
        if (data) {
          setMatchData(data);
          // Sync with store
          const snapshot = scoringEngine.calculateSnapshot(data);
          activeMatch.setMatch(data.uuid, snapshot);
          activeMatch.setRunning(true);
        }
      } catch (error) {
        logger.error("Failed to load match for scoring", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadMatch();
  }, [matchId, db]);

  // 2. Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeMatch.isRunning) {
      interval = setInterval(() => {
        activeMatch.tick();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMatch.isRunning]);

  // 3. Persist on Change
  const persistMatch = useCallback(async (updatedMatch: Match) => {
    try {
      await matchDb(db).updateMatch(updatedMatch);
    } catch (error) {
      logger.error("Failed to persist match update", error);
    }
  }, [db]);

  // 4. Scoring Handlers
  const handlePoint = async (teamId: string) => {
    if (!match) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const snapshot = {
      score: activeMatch.score,
      servingTeamId: activeMatch.servingTeamId!,
      servingPlayerId: activeMatch.servingPlayerId!,
      serverNumber: activeMatch.serverNumber,
      isFirstServer: activeMatch.isFirstServer,
      timeoutsUsed: activeMatch.timeoutsUsed,
    };

    const result = scoringEngine.addPoint(snapshot, teamId, match);
    activeMatch.applyEvent(result.snapshot);

    const updatedMatch: Match = {
      ...match,
      events: [...match.events, result.event],
      score: result.snapshot.score,
      servingTeamId: result.snapshot.servingTeamId,
      servingPlayerId: result.snapshot.servingPlayerId,
      serverNumber: result.snapshot.serverNumber as 1 | 2,
      updated_at: new Date().toISOString(),
    };
    setMatchData(updatedMatch);
    persistMatch(updatedMatch);

    // Check Win
    const winner = scoringEngine.checkWinCondition(result.snapshot, match);
    if (winner) {
      handleEndMatch(updatedMatch);
    }
  };

  const handleFault = async () => {
    if (!match || !activeMatch.servingPlayerId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const snapshot = {
      score: activeMatch.score,
      servingTeamId: activeMatch.servingTeamId!,
      servingPlayerId: activeMatch.servingPlayerId!,
      serverNumber: activeMatch.serverNumber,
      isFirstServer: activeMatch.isFirstServer,
      timeoutsUsed: activeMatch.timeoutsUsed,
    };

    const result = scoringEngine.addFault(snapshot, activeMatch.servingPlayerId, match);
    activeMatch.applyEvent(result.snapshot);

    const updatedMatch: Match = {
      ...match,
      events: [...match.events, result.event],
      score: result.snapshot.score,
      servingTeamId: result.snapshot.servingTeamId,
      servingPlayerId: result.snapshot.servingPlayerId,
      serverNumber: result.snapshot.serverNumber as 1 | 2,
      updated_at: new Date().toISOString(),
    };
    setMatchData(updatedMatch);
    persistMatch(updatedMatch);
  };

  const handleUndo = async () => {
    if (!match || match.events.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = scoringEngine.undo(match);
    activeMatch.applyEvent(result.snapshot);

    const updatedMatch: Match = {
      ...match,
      events: match.events.slice(0, -1),
      score: result.snapshot.score,
      servingTeamId: result.snapshot.servingTeamId,
      servingPlayerId: result.snapshot.servingPlayerId,
      serverNumber: result.snapshot.serverNumber as 1 | 2,
      updated_at: new Date().toISOString(),
    };
    setMatchData(updatedMatch);
    persistMatch(updatedMatch);
  };

  const handleTimeout = async () => {
    if (!match || !activeMatch.servingTeamId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const snapshot = {
      score: activeMatch.score,
      servingTeamId: activeMatch.servingTeamId!,
      servingPlayerId: activeMatch.servingPlayerId!,
      serverNumber: activeMatch.serverNumber,
      isFirstServer: activeMatch.isFirstServer,
      timeoutsUsed: activeMatch.timeoutsUsed,
    };

    const result = scoringEngine.callTimeout(snapshot, activeMatch.servingTeamId);
    activeMatch.applyEvent(result.snapshot);

    const updatedMatch: Match = {
      ...match,
      events: [...match.events, result.event],
      updated_at: new Date().toISOString(),
    };
    setMatchData(updatedMatch);
    persistMatch(updatedMatch);
    
    Alert.alert("Timeout", "Timeout called by " + match.teams.find(t => t.id === activeMatch.servingTeamId)?.name);
  };

  const handleEndMatch = async (finalMatch?: Match) => {
    const matchToEnd = finalMatch || match;
    if (!matchToEnd) return;

    activeMatch.setRunning(false);
    
    const completedMatch: Match = {
      ...matchToEnd,
      status: "completed",
      completedAt: new Date().toISOString(),
      durationSeconds: activeMatch.timerSeconds,
      updated_at: new Date().toISOString(),
    };

    await persistMatch(completedMatch);
    activeMatch.clearMatch();
    navigation.navigate("MatchSummary", { matchId: completedMatch.uuid });
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!match) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background dark:bg-background-dark p-4">
        <Text className="text-2xl font-heading text-primary">No Active Match</Text>
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

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-1 p-4">
        {/* Header: Timer */}
        <View className="items-center mb-8">
          <MatchTimer
            seconds={activeMatch.timerSeconds}
            isRunning={activeMatch.isRunning}
          />
        </View>

        {/* Scoreboard */}
        <View className="flex-row flex-1">
          <TeamCard
            side="left"
            team={teamA}
            score={activeMatch.score[teamA.id] || 0}
            isServing={activeMatch.servingTeamId === teamA.id}
            serverNumber={activeMatch.servingTeamId === teamA.id ? activeMatch.serverNumber : undefined}
            onPress={() => handlePoint(teamA.id)}
            onLongPress={handleFault}
          />
          <TeamCard
            side="right"
            team={teamB}
            score={activeMatch.score[teamB.id] || 0}
            isServing={activeMatch.servingTeamId === teamB.id}
            serverNumber={activeMatch.servingTeamId === teamB.id ? activeMatch.serverNumber : undefined}
            onPress={() => handlePoint(teamB.id)}
            onLongPress={handleFault}
          />
        </View>

        <View className="mt-4 items-center">
          <Text className="text-gray-500 font-body text-xs">
            Tap to add point • Long press for fault
          </Text>
        </View>
      </View>

      {/* Footer: Actions */}
      <ActionBar
        onUndo={handleUndo}
        onTimeout={handleTimeout}
        onEndMatch={() => {
          Alert.alert(
            "End Match",
            "Are you sure you want to end this match early?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "End Match", style: "destructive", onPress: () => handleEndMatch() },
            ]
          );
        }}
        canUndo={match.events.length > 0}
        canTimeout={(activeMatch.timeoutsUsed[activeMatch.servingTeamId!] || 0) < 2}
      />
    </SafeAreaView>
  );
}
