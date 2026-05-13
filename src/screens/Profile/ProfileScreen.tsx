import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";

import type { ProfileStackParamList } from "@/navigation/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { matchDb } from "@/services/db/matchDb";
import { calculateSnapshot, checkWinCondition } from "@/features/scoring/scoringEngine";
import { logger } from "@/utils/logger";
import { formatDuration } from "@/utils/formatDate";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, "Profile">>();
  const db = useSQLiteContext();

  const [displayName, setDisplayName] = useState("Local Player");
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ 
    totalMatches: 0, 
    totalWins: 0,
    totalSeconds: 0 
  });

  const loadProfileData = useCallback(async () => {
    try {
      const matches = await matchDb(db).getAllMatches();
      // Only count matches that aren't soft-deleted
      const activeMatches = matches.filter(m => m.sync_status !== "deleted");
      const completed = activeMatches.filter(m => m.status === "completed");
      
      let wins = 0;
      let duration = 0;

      completed.forEach(match => {
        const snapshot = calculateSnapshot(match);
        const winner = checkWinCondition(snapshot, match);
        // For Phase 1 local play, we assume the user is the first team
        if (winner && winner.id === match.teams[0].id) {
          wins++;
        }
        duration += match.durationSeconds || 0;
      });

      setStats({
        totalMatches: completed.length,
        totalWins: wins,
        totalSeconds: duration,
      });
    } catch (error) {
      logger.error("Failed to load profile stats", error);
    }
  }, [db]);

  // Single load mechanism — focus listener handles everything including mount
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadProfileData);
    return unsubscribe;
  }, [navigation, loadProfileData]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        {/* Profile Header */}
        <View className="items-center mt-6 mb-12">
          <View className="w-28 h-24 bg-primary/10 dark:bg-primary/20 rounded-3xl items-center justify-center mb-6">
            <Text className="text-primary text-5xl font-heading">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          {isEditing ? (
            <View className="flex-row items-center bg-gray-50 dark:bg-surface p-2 rounded-2xl border border-primary">
              <TextInput
                className="text-2xl font-heading text-black dark:text-white px-4 py-1 min-w-[200px] text-center"
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
                placeholder="Your name"
              />
              <TouchableOpacity 
                onPress={() => setIsEditing(false)} 
                className="bg-primary px-4 py-2 rounded-xl"
              >
                <Text className="text-white font-heading text-sm">Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={() => setIsEditing(true)} 
              className="items-center"
              activeOpacity={0.7}
            >
              <Text className="text-3xl font-heading text-black dark:text-white">
                {displayName}
              </Text>
              <View className="mt-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                <Text className="text-[10px] font-heading text-gray-400 uppercase tracking-widest">
                  Tap to Edit Profile
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* Highlight Stats */}
        <View className="flex-row justify-between mb-10">
          <View className="w-[31%]">
            <Card className="items-center justify-center py-6 border border-gray-50 dark:border-gray-800">
              <Text className="text-2xl font-scoreboard text-primary">
                {stats.totalMatches}
              </Text>
              <Text className="text-[8px] font-heading text-gray-400 uppercase mt-1">
                Games
              </Text>
            </Card>
          </View>
          <View className="w-[31%]">
            <Card className="items-center justify-center py-6 border border-gray-50 dark:border-gray-800">
              <Text className="text-2xl font-scoreboard text-secondary">
                {stats.totalWins}
              </Text>
              <Text className="text-[8px] font-heading text-gray-400 uppercase mt-1">
                Wins
              </Text>
            </Card>
          </View>
          <View className="w-[31%]">
            <Card className="items-center justify-center py-6 border border-gray-50 dark:border-gray-800">
              <Text className="text-lg font-scoreboard text-black dark:text-white" numberOfLines={1}>
                {Math.floor(stats.totalSeconds / 60)}m
              </Text>
              <Text className="text-[8px] font-heading text-gray-400 uppercase mt-1">
                Time
              </Text>
            </Card>
          </View>
        </View>

        {/* Menu Items */}
        <View className="mb-10">
           <Text className="text-xs font-heading text-gray-400 uppercase tracking-widest mb-3 ml-1">
            Account
          </Text>
          <Card className="p-0 overflow-hidden border border-gray-50 dark:border-gray-800">
            <TouchableOpacity 
              className="flex-row items-center justify-between p-5 border-b border-gray-50 dark:border-gray-800"
              onPress={() => navigation.navigate("Settings")}
              activeOpacity={0.6}
            >
              <View>
                <Text className="text-base font-heading text-black dark:text-white">App Settings</Text>
                <Text className="text-xs font-body text-gray-400">Haptics, sound, and data.</Text>
              </View>
              <Text className="text-gray-300 font-scoreboard text-xl">·</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center justify-between p-5"
              onPress={() => Alert.alert("Export Data", "Exporting match history as CSV coming in Phase 2.")}
              activeOpacity={0.6}
            >
              <View>
                <Text className="text-base font-heading text-black dark:text-white">Export History</Text>
                <Text className="text-xs font-body text-gray-400">Download your match records.</Text>
              </View>
              <Text className="text-gray-300 font-scoreboard text-xl">·</Text>
            </TouchableOpacity>
          </Card>
        </View>

        <Button
          variant="secondary"
          size="lg"
          className="bg-primary/10 border-transparent mb-4"
          onPress={() => Alert.alert("Phase 2 Feature", "Cloud sync and player rankings will be available in the next update.")}
        >
          Enable Cloud Sync
        </Button>
        
        <Text className="text-center text-[10px] font-body text-gray-400 mt-2 uppercase tracking-[1px]">
          User ID: Local-01
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
