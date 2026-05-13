import React from "react";
import { View, Text, Switch, ScrollView, SafeAreaView, Alert } from "react-native";
import { useSQLiteContext } from "expo-sqlite";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { colors } from "@/constants/theme";
import { logger } from "@/utils/logger";
import { useSettingsStore } from "@/store/settingsStore";

export function SettingsScreen() {
  const db = useSQLiteContext();
  const { 
    hapticsEnabled, 
    soundEnabled, 
    setHapticsEnabled, 
    setSoundEnabled 
  } = useSettingsStore();

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all local match history? This will soft-delete all records.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              await db.runAsync(
                "UPDATE matches SET sync_status = 'deleted', updated_at = ?;",
                new Date().toISOString()
              );
              Alert.alert("Success", "Local history cleared.");
            } catch (error) {
              logger.error("Failed to clear history", error);
              Alert.alert("Error", "Could not clear local history.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text className="text-3xl font-heading text-black dark:text-white mb-8">
          Settings
        </Text>

        <View className="mb-8">
          <Text className="text-xs font-heading text-gray-400 uppercase tracking-widest mb-3">
            Preferences
          </Text>
          <Card className="p-0 overflow-hidden border border-gray-50 dark:border-gray-800">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
              <View className="flex-1 mr-4">
                <Text className="text-base font-heading text-black dark:text-white">
                  Haptic Feedback
                </Text>
                <Text className="text-xs font-body text-gray-400">
                  Vibrate on scoring and actions.
                </Text>
              </View>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: "#E5E7EB", true: colors.primary }}
              />
            </View>

            <View className="flex-row items-center justify-between p-4">
              <View className="flex-1 mr-4">
                <Text className="text-base font-heading text-black dark:text-white">
                  Sound Effects
                </Text>
                <Text className="text-xs font-body text-gray-400">
                  Play audio cues during matches.
                </Text>
              </View>
              <Switch
                value={soundEnabled}
                onValueChange={setSoundEnabled}
                trackColor={{ false: "#E5E7EB", true: colors.primary }}
              />
            </View>
          </Card>
        </View>

        <View className="mb-10">
          <Text className="text-xs font-heading text-gray-400 uppercase tracking-widest mb-3">
            System
          </Text>
          <Card className="p-0 overflow-hidden border border-gray-50 dark:border-gray-800">
            <View className="flex-row items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
              <Text className="text-sm font-body text-gray-500">Version</Text>
              <Text className="text-sm font-heading text-black dark:text-white">1.0.0 (Phase 1)</Text>
            </View>
            <View className="flex-row items-center justify-between p-4">
              <Text className="text-sm font-body text-gray-500">Engine</Text>
              <Text className="text-sm font-heading text-black dark:text-white">DULA-Core v1.2</Text>
            </View>
          </Card>
        </View>

        <View className="mt-4 pt-8 border-t border-gray-100 dark:border-gray-800">
          <Button
            variant="error"
            size="md"
            className="bg-transparent border border-error/20"
            onPress={handleClearHistory}
          >
            Clear Local History
          </Button>
          <Text className="text-center text-[10px] font-body text-gray-400 mt-4 uppercase tracking-[2px]">
            Designed for Pickleballers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
