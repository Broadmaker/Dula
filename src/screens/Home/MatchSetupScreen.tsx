import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";
import * as Crypto from "expo-crypto";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { matchDb } from "@/services/db/matchDb";
import { SCORE_LIMITS, LOCAL_USER_ID } from "@/constants/scoring";
import { colors } from "@/constants/theme";
import { MatchType, ScoreLimit, Match, Team } from "@/types/match.types";
import type { HomeStackParamList, MainTabParamList } from "@/navigation/types";
import { useActiveMatchStore } from "@/store/activeMatchStore";
import * as scoringEngine from "@/features/scoring/scoringEngine";
import { logger } from "@/utils/logger";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, "MatchSetup">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function MatchSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const db = useSQLiteContext();
  const setMatchStore = useActiveMatchStore((s) => s.setMatch);

  // Form State
  const [matchType, setMatchType] = useState<MatchType>("doubles");
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");
  const [scoreLimit, setScoreLimit] = useState<ScoreLimit>(11);
  const [winByTwo, setWinByTwo] = useState(true);
  const [rallyScoring, setRallyScoring] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartMatch = async () => {
    // Validation
    if (!teamAName.trim() || !teamBName.trim()) {
      Alert.alert("Required Fields", "Please enter names for both teams/players.");
      return;
    }

    setIsSubmitting(true);
    try {
      const matchUuid = Crypto.randomUUID();
      const now = new Date().toISOString();

      const teamAId = Crypto.randomUUID();
      const teamBId = Crypto.randomUUID();

      // Create Team objects
      const teamA: Team = {
        id: teamAId,
        name: teamAName.trim(),
        playerIds: matchType === "doubles" ? [Crypto.randomUUID(), Crypto.randomUUID()] : [Crypto.randomUUID()],
      };

      const teamB: Team = {
        id: teamBId,
        name: teamBName.trim(),
        playerIds: matchType === "doubles" ? [Crypto.randomUUID(), Crypto.randomUUID()] : [Crypto.randomUUID()],
      };

      const newMatch: Match = {
        id: 0,
        uuid: matchUuid,
        server_id: null,
        sync_status: "pending",
        sync_error: null,
        created_at: now,
        updated_at: now,
        ownerId: LOCAL_USER_ID,
        type: matchType,
        status: "active",
        scoreLimit,
        winByTwo,
        rallyScoring,
        tournamentMode: false,
        isPublic: false,
        teams: [teamA, teamB],
        events: [],
        score: { [teamAId]: 0, [teamBId]: 0 },
        servingTeamId: teamAId,
        servingPlayerId: teamA.playerIds[0],
        startedAt: now,
      };

      // 1. Get initial state
      const snapshot = scoringEngine.getInitialMatchState(newMatch);

      // 2. Persist to DB
      await matchDb(db).insertMatch(newMatch);

      // 3. Set in Store
      setMatchStore(matchUuid, snapshot);

      // 4. Navigate
      navigation.navigate("MatchTab", {
        screen: "LiveScoring",
        params: { matchId: matchUuid },
      });
    } catch (error) {
      logger.error("Failed to setup match", error);
      Alert.alert("Error", "Could not create match. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white dark:bg-[#121212]"
    >
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-3xl font-heading text-black dark:text-white mb-8">
          Match Setup
        </Text>

        {/* Match Type */}
        <View className="mb-8">
          <Text className="text-xs font-heading text-gray-400 uppercase tracking-widest mb-3">
            Match Type
          </Text>
          <View className="flex-row bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
            {(["singles", "doubles"] as MatchType[]).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setMatchType(type)}
                className={`flex-1 py-3 rounded-xl items-center ${
                  matchType === type ? "bg-white dark:bg-surface shadow-sm" : ""
                }`}
              >
                <Text
                  className={`font-heading capitalize ${
                    matchType === type ? "text-primary" : "text-gray-400"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Team Names */}
        <View className="mb-8">
          <Text className="text-xs font-heading text-gray-400 uppercase tracking-widest mb-3">
            Teams
          </Text>
          <Card className="p-5">
            <View className="mb-4">
              <Text className="text-[10px] font-heading text-primary uppercase mb-1.5 ml-1">
                {matchType === "singles" ? "Player 1" : "Team A"}
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-[#121212] p-4 rounded-xl font-body text-base text-black dark:text-white border border-gray-100 dark:border-gray-800"
                value={teamAName}
                onChangeText={setTeamAName}
                placeholder="Enter name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
            <View>
              <Text className="text-[10px] font-heading text-secondary uppercase mb-1.5 ml-1">
                {matchType === "singles" ? "Player 2" : "Team B"}
              </Text>
              <TextInput
                className="bg-gray-50 dark:bg-[#121212] p-4 rounded-xl font-body text-base text-black dark:text-white border border-gray-100 dark:border-gray-800"
                value={teamBName}
                onChangeText={setTeamBName}
                placeholder="Enter name"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </Card>
        </View>

        {/* Scoring Settings */}
        <View className="mb-8">
          <Text className="text-xs font-heading text-gray-400 uppercase tracking-widest mb-3">
            Scoring Rules
          </Text>
          <Card className="p-5">
            <View className="mb-6">
              <Text className="text-sm font-body text-gray-500 mb-3">Score Limit</Text>
              <View className="flex-row">
                {SCORE_LIMITS.map((limit) => (
                  <TouchableOpacity
                    key={limit}
                    onPress={() => setScoreLimit(limit as ScoreLimit)}
                    className={`flex-1 py-3 mx-1 rounded-xl items-center border ${
                      scoreLimit === limit
                        ? "bg-primary border-primary"
                        : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#121212]"
                    }`}
                  >
                    <Text
                      className={`font-heading ${
                        scoreLimit === limit ? "text-white" : "text-gray-400"
                      }`}
                    >
                      {limit}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View className="flex-row items-center justify-between mb-6">
              <View className="flex-1 mr-4">
                <Text className="text-base font-heading text-black dark:text-white">
                  Win by 2
                </Text>
                <Text className="text-xs font-body text-gray-400">
                  Must lead by 2 points to win.
                </Text>
              </View>
              <Switch
                value={winByTwo}
                onValueChange={setWinByTwo}
                trackColor={{ false: "#E5E7EB", true: colors.primary }}
              />
            </View>

            <View className="flex-row items-center justify-between">
              <View className="flex-1 mr-4">
                <Text className="text-base font-heading text-black dark:text-white">
                  Rally Scoring
                </Text>
                <Text className="text-xs font-body text-gray-400">
                  Point awarded on every rally.
                </Text>
              </View>
              <Switch
                value={rallyScoring}
                onValueChange={setRallyScoring}
                trackColor={{ false: "#E5E7EB", true: colors.primary }}
              />
            </View>
          </Card>
        </View>

        <Button
          size="lg"
          isLoading={isSubmitting}
          onPress={handleStartMatch}
          className="mt-4"
        >
          Start Match
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
