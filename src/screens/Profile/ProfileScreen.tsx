import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSQLiteContext } from "expo-sqlite";

import type { ProfileStackParamList } from "@/navigation/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { matchDb } from "@/services/db/matchDb";
import { logger } from "@/utils/logger";

export function ProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList, "Profile">>();
  const db = useSQLiteContext();

  const [displayName, setDisplayName] = useState("Mark Dev");
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState({ totalMatches: 0, totalWins: 0 });

  useEffect(() => {
    async function loadStats() {
      try {
        const matches = await matchDb(db).getAllMatches();
        const completed = matches.filter(m => m.status === "completed");
        
        // Very simple win detection for local user (ownerId check deferred to Phase 2)
        // For Phase 1, we just show total games recorded locally
        setStats({
          totalMatches: completed.length,
          totalWins: 0, // Simplified for Phase 1
        });
      } catch (error) {
        logger.error("Failed to load profile stats", error);
      }
    }

    const unsubscribe = navigation.addListener("focus", loadStats);
    loadStats();
    return unsubscribe;
  }, [navigation, db]);

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        {/* Profile Header */}
        <View className="items-center mt-8 mb-10">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center shadow-xl mb-4">
            <Text className="text-white text-4xl font-heading">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          {isEditing ? (
            <View className="flex-row items-center">
              <TextInput
                className="text-2xl font-heading text-black dark:text-white border-b-2 border-primary min-w-[150px] text-center"
                value={displayName}
                onChangeText={setDisplayName}
                autoFocus
              />
              <TouchableOpacity onPress={() => setIsEditing(false)} className="ml-2">
                <Text className="text-primary font-heading">Save</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)} className="flex-row items-center">
              <Text className="text-2xl font-heading text-black dark:text-white">
                {displayName}
              </Text>
              <View className="ml-2 bg-gray-100 dark:bg-gray-800 p-1 rounded">
                <Text className="text-[10px] font-body text-gray-500 uppercase">Edit</Text>
              </View>
            </TouchableOpacity>
          )}
          <Text className="text-sm font-body text-gray-500 mt-1 uppercase tracking-widest">
            Local Player
          </Text>
        </View>

        {/* Stats Grid */}
        <View className="flex-row justify-between mb-8">
          <View className="w-[48%]">
            <Card className="items-center justify-center py-6">
              <Text className="text-3xl font-scoreboard text-primary">
                {stats.totalMatches}
              </Text>
              <Text className="text-xs font-heading text-gray-400 uppercase mt-1">
                Games Played
              </Text>
            </Card>
          </View>
          <View className="w-[48%]">
            <Card className="items-center justify-center py-6">
              <Text className="text-3xl font-scoreboard text-secondary">
                {stats.totalWins}
              </Text>
              <Text className="text-xs font-heading text-gray-400 uppercase mt-1">
                Wins
              </Text>
            </Card>
          </View>
        </View>

        {/* Quick Links */}
        <Card className="mb-6 p-0 overflow-hidden">
          <TouchableOpacity 
            className="flex-row items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800"
            onPress={() => navigation.navigate("Settings")}
          >
            <Text className="text-base font-body text-black dark:text-white">App Settings</Text>
            <Text className="text-gray-300 font-scoreboard text-xl">{">"}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity className="flex-row items-center justify-between p-4">
            <Text className="text-base font-body text-black dark:text-white">Export Local Data</Text>
            <Text className="text-gray-300 font-scoreboard text-xl">{">"}</Text>
          </TouchableOpacity>
        </Card>

        <Button
          variant="ghost"
          onPress={() => logger.info("Sign in action placeholder")}
        >
          Sign In (Cloud Sync)
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
