import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";
import * as Crypto from "expo-crypto";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { matchDb } from "@/services/db/matchDb";
import { SCORE_LIMITS } from "@/constants/scoring";
import { MatchType, ScoreLimit, Match } from "@/types/match.types";
import type { HomeStackParamList, MainTabParamList } from "@/navigation/types";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, "MatchSetup">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function MatchSetupScreen() {
  const navigation = useNavigation<NavigationProp>();
  const db = useSQLiteContext();

  // Form State
  const [matchType, setMatchType] = useState<MatchType>("doubles");
  const [scoreLimit, setScoreLimit] = useState<ScoreLimit>(11);
  const [winByTwo, setWinByTwo] = useState(true);
  const [rallyScoring, setRallyScoring] = useState(false);
  
  const [teamAName, setTeamAName] = useState("Team A");
  const [teamBName, setTeamBName] = useState("Team B");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleStartMatch = async () => {
    if (!teamAName.trim() || !teamBName.trim()) {
      Alert.alert("Error", "Please enter names for both teams.");
      return;
    }

    setIsSubmitting(true);
    try {
      const matchUuid = Crypto.randomUUID();
      const now = new Date().toISOString();

      const teamAId = Crypto.randomUUID();
      const teamBId = Crypto.randomUUID();

      const newMatch: Match = {
        id: 0,
        uuid: matchUuid,
        server_id: null,
        sync_status: "pending",
        sync_error: null,
        created_at: now,
        updated_at: now,
        ownerId: "local-user", // Placeholder for Phase 1
        type: matchType,
        status: "active",
        scoreLimit,
        winByTwo,
        rallyScoring,
        tournamentMode: false,
        isPublic: false,
        teams: [
          { id: teamAId, name: teamAName, playerIds: matchType === "doubles" ? ["p1", "p2"] : ["p1"] },
          { id: teamBId, name: teamBName, playerIds: matchType === "doubles" ? ["p3", "p4"] : ["p2"] },
        ],
        events: [],
        score: { [teamAId]: 0, [teamBId]: 0 },
        serverNumber: matchType === "doubles" ? 2 : 1, // Start at 2 for doubles first server rule
        servingTeamId: teamAId,
        servingPlayerId: matchType === "doubles" ? "p1" : "p1", // Simplified for Phase 1
        startedAt: now,
      };

      await matchDb(db).insertMatch(newMatch);

      navigation.navigate("MatchTab", {
        screen: "LiveScoring",
        params: { matchId: matchUuid },
      });
    } catch (error) {
      console.error("Failed to start match:", error);
      Alert.alert("Error", "Could not create the match. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background dark:bg-background-dark">
      <View className="p-4 pb-10">
        <Text className="text-3xl font-heading text-black dark:text-white mb-6">
          New Match
        </Text>

        {/* Match Type */}
        <Text className="text-lg font-heading text-black dark:text-white mb-2">
          Match Type
        </Text>
        <View className="flex-row mb-6">
          {(["singles", "doubles"] as MatchType[]).map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => setMatchType(type)}
              className={`flex-1 py-3 border-b-2 items-center ${
                matchType === type ? "border-primary" : "border-gray-200 dark:border-gray-800"
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

        {/* Team Names */}
        <Card className="mb-6">
          <Text className="text-base font-heading text-black dark:text-white mb-4">
            Teams
          </Text>
          <View className="mb-4">
            <Text className="text-sm font-body text-gray-500 mb-1">Team A Name</Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl font-body text-black dark:text-white"
              value={teamAName}
              onChangeText={setTeamAName}
              placeholder="Enter name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <View>
            <Text className="text-sm font-body text-gray-500 mb-1">Team B Name</Text>
            <TextInput
              className="bg-gray-100 dark:bg-gray-800 p-3 rounded-xl font-body text-black dark:text-white"
              value={teamBName}
              onChangeText={setTeamBName}
              placeholder="Enter name"
              placeholderTextColor="#9CA3AF"
            />
          </View>
        </Card>

        {/* Scoring Settings */}
        <Card className="mb-6">
          <Text className="text-base font-heading text-black dark:text-white mb-4">
            Scoring Settings
          </Text>
          
          <Text className="text-sm font-body text-gray-500 mb-2">Score Limit</Text>
          <View className="flex-row mb-6">
            {SCORE_LIMITS.map((limit) => (
              <TouchableOpacity
                key={limit}
                onPress={() => setScoreLimit(limit as ScoreLimit)}
                className={`flex-1 py-2 mx-1 rounded-lg items-center border ${
                  scoreLimit === limit
                    ? "bg-primary border-primary"
                    : "border-gray-200 dark:border-gray-800"
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

          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-base font-body text-black dark:text-white">
                Win by 2
              </Text>
              <Text className="text-xs font-body text-gray-500">
                Match continues until 2-point gap
              </Text>
            </View>
            <Switch
              value={winByTwo}
              onValueChange={setWinByTwo}
              trackColor={{ false: "#D1D5DB", true: "#4CAF50" }}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-body text-black dark:text-white">
                Rally Scoring
              </Text>
              <Text className="text-xs font-body text-gray-500">
                Point awarded on every rally
              </Text>
            </View>
            <Switch
              value={rallyScoring}
              onValueChange={setRallyScoring}
              trackColor={{ false: "#D1D5DB", true: "#4CAF50" }}
            />
          </View>
        </Card>

        <Button
          isLoading={isSubmitting}
          onPress={handleStartMatch}
        >
          Start Match
        </Button>
      </View>
    </ScrollView>
  );
}
