import React, { useEffect, useState, useCallback } from "react";
import { View, Text, Alert, SafeAreaView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type {
  RouteProp,
  CompositeNavigationProp,
} from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";
import * as Haptics from "expo-haptics";

import type { MatchStackParamList, MainTabParamList } from "@/navigation/types";
import {
  useActiveMatchStore,
  type MatchSnapshot,
} from "@/store/activeMatchStore";
import { matchDb } from "@/services/db/matchDb";
import * as scoringEngine from "@/features/scoring/scoringEngine";
import { TeamCard } from "@/components/features/scoring/TeamCard";
import { MatchTimer } from "@/components/features/scoring/MatchTimer";
import { ActionBar } from "@/components/features/scoring/ActionBar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Button } from "@/components/ui/Button";
import type { Match } from "@/types/match.types";
import { logger } from "@/utils/logger";
import { MAX_TIMEOUTS_PER_TEAM } from "@/constants/scoring";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MatchStackParamList, "LiveScoring">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function LiveScoringScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MatchStackParamList, "LiveScoring">>();
  const db = useSQLiteContext();

  // ─── Store selectors — stable references, no whole-store subscription ────
  const setMatch = useActiveMatchStore((s) => s.setMatch);
  const setRunning = useActiveMatchStore((s) => s.setRunning);
  const tick = useActiveMatchStore((s) => s.tick);
  const applyEvent = useActiveMatchStore((s) => s.applyEvent);
  const clearMatch = useActiveMatchStore((s) => s.clearMatch);
  const isRunning = useActiveMatchStore((s) => s.isRunning);
  const timerSeconds = useActiveMatchStore((s) => s.timerSeconds);
  const score = useActiveMatchStore((s) => s.score);
  const servingTeamId = useActiveMatchStore((s) => s.servingTeamId);
  const servingPlayerId = useActiveMatchStore((s) => s.servingPlayerId);
  const serverNumber = useActiveMatchStore((s) => s.serverNumber);
  const isFirstServer = useActiveMatchStore((s) => s.isFirstServer);
  const timeoutsUsed = useActiveMatchStore((s) => s.timeoutsUsed);

  const [match, setMatchData] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const matchId = route.params?.matchId;

  // ─── Load match + sync store ──────────────────────────────────────────────
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
          const snapshot = scoringEngine.calculateSnapshot(data);
          setMatch(data.uuid, snapshot);
          setRunning(true);
        }
      } catch (error) {
        logger.error("Failed to load match for scoring", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMatch();
  }, [matchId, db, setMatch, setRunning]);

  // ─── Timer ────────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isRunning) {
      interval = setInterval(() => tick(), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, tick]);

  // ─── Persist helper ───────────────────────────────────────────────────────
  const persistMatch = useCallback(
    async (updatedMatch: Match) => {
      try {
        await matchDb(db).updateMatch(updatedMatch);
      } catch (error) {
        logger.error("Failed to persist match update", error);
      }
    },
    [db],
  );

  // ─── Snapshot helper — builds current snapshot from store selectors ───────
  const getCurrentSnapshot = useCallback(
    (): MatchSnapshot => ({
      score,
      servingTeamId: servingTeamId!,
      servingPlayerId: servingPlayerId!,
      serverNumber,
      isFirstServer,
      timeoutsUsed,
    }),
    [
      score,
      servingTeamId,
      servingPlayerId,
      serverNumber,
      isFirstServer,
      timeoutsUsed,
    ],
  );

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleFault = useCallback(async () => {
    if (!match || !servingPlayerId) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

    const result = scoringEngine.addFault(
      getCurrentSnapshot(),
      servingPlayerId,
      match,
    );
    applyEvent(result.snapshot);

    const updatedMatch: Match = {
      ...match,
      events: [...match.events, result.event],
      score: result.snapshot.score,
      servingTeamId: result.snapshot.servingTeamId,
      servingPlayerId: result.snapshot.servingPlayerId,
      updated_at: new Date().toISOString(),
    };
    setMatchData(updatedMatch);
    persistMatch(updatedMatch);
  }, [match, servingPlayerId, getCurrentSnapshot, applyEvent, persistMatch]);

  const handleUndo = useCallback(async () => {
    if (!match || match.events.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = scoringEngine.undo(match);
    applyEvent(result.snapshot);

    const updatedMatch: Match = {
      ...match,
      events: match.events.slice(0, -1),
      score: result.snapshot.score,
      servingTeamId: result.snapshot.servingTeamId,
      servingPlayerId: result.snapshot.servingPlayerId,
      updated_at: new Date().toISOString(),
    };
    setMatchData(updatedMatch);
    persistMatch(updatedMatch);
  }, [match, applyEvent, persistMatch]);

  const handleTimeout = useCallback(async () => {
    if (!match || !servingTeamId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const result = scoringEngine.callTimeout(
      getCurrentSnapshot(),
      servingTeamId,
    );
    applyEvent(result.snapshot);

    const updatedMatch: Match = {
      ...match,
      events: [...match.events, result.event],
      updated_at: new Date().toISOString(),
    };
    setMatchData(updatedMatch);
    persistMatch(updatedMatch);

    const teamName = match.teams.find((t) => t.id === servingTeamId)?.name;
    Alert.alert("Timeout", `Timeout called by ${teamName}`);
  }, [match, servingTeamId, getCurrentSnapshot, applyEvent, persistMatch]);

  // Define handleEndMatch BEFORE handlePoint
  const handleEndMatch = useCallback(
    async (finalMatch?: Match) => {
      const matchToEnd = finalMatch || match;
      if (!matchToEnd) return;

      setRunning(false);
      const completedMatch: Match = {
        ...matchToEnd,
        status: "completed",
        completedAt: new Date().toISOString(),
        durationSeconds: timerSeconds,
        updated_at: new Date().toISOString(),
      };

      await persistMatch(completedMatch);
      clearMatch();
      navigation.navigate("MatchSummary", { matchId: completedMatch.uuid });
    },
    [match, timerSeconds, setRunning, clearMatch, persistMatch, navigation],
  );

  // Now handlePoint can safely depend on handleEndMatch
  const handlePoint = useCallback(
    async (teamId: string) => {
      if (!match) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const result = scoringEngine.addPoint(
        getCurrentSnapshot(),
        teamId,
        match,
      );
      applyEvent(result.snapshot);

      const updatedMatch: Match = {
        ...match,
        events: [...match.events, result.event],
        score: result.snapshot.score,
        servingTeamId: result.snapshot.servingTeamId,
        servingPlayerId: result.snapshot.servingPlayerId,
        updated_at: new Date().toISOString(),
      };
      setMatchData(updatedMatch);
      persistMatch(updatedMatch);

      const winner = scoringEngine.checkWinCondition(result.snapshot, match);
      if (winner) handleEndMatch(updatedMatch);
    },
    [match, getCurrentSnapshot, applyEvent, persistMatch, handleEndMatch],
  ); // ← add handleEndMatch

  // ─── Render ───────────────────────────────────────────────────────────────
  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!match) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-[#121212] p-4">
        <Text className="text-2xl font-heading text-primary">
          No Active Match
        </Text>
        <Button
          className="mt-6"
          onPress={() =>
            navigation.navigate("HomeTab", { screen: "Dashboard" })
          }
        >
          Go to Dashboard
        </Button>
      </SafeAreaView>
    );
  }

  const teamA = match.teams[0];
  const teamB = match.teams[1];

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <View className="flex-1 p-4">
        <View className="items-center mb-8">
          <MatchTimer seconds={timerSeconds} isRunning={isRunning} />
        </View>

        <View className="flex-row flex-1">
          <TeamCard
            side="left"
            team={teamA}
            score={score[teamA.id] ?? 0}
            isServing={servingTeamId === teamA.id}
            serverNumber={servingTeamId === teamA.id ? serverNumber : undefined}
            onPress={() => handlePoint(teamA.id)}
            onLongPress={handleFault}
          />
          <TeamCard
            side="right"
            team={teamB}
            score={score[teamB.id] ?? 0}
            isServing={servingTeamId === teamB.id}
            serverNumber={servingTeamId === teamB.id ? serverNumber : undefined}
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

      <ActionBar
        onUndo={handleUndo}
        onTimeout={handleTimeout}
        onEndMatch={() => {
          Alert.alert(
            "End Match",
            "Are you sure you want to end this match early?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "End Match",
                style: "destructive",
                onPress: () => handleEndMatch(),
              },
            ],
          );
        }}
        canUndo={match.events.length > 0}
        canTimeout={(timeoutsUsed[servingTeamId!] ?? 0) < MAX_TIMEOUTS_PER_TEAM}
      />
    </SafeAreaView>
  );
}
