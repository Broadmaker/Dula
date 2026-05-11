import React from "react";
import { View, Text, Switch, ScrollView, SafeAreaView } from "react-native";
import { Card } from "@/components/ui/Card";

export function SettingsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <ScrollView className="flex-1 p-4">
        <Text className="text-3xl font-heading text-black dark:text-white mb-6">
          Settings
        </Text>

        <Card className="mb-6">
          <Text className="text-lg font-heading text-black dark:text-white mb-4">
            Preferences
          </Text>
          
          <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <View>
              <Text className="text-base font-body text-black dark:text-white">
                Live Match Sync
              </Text>
              <Text className="text-xs font-body text-secondary">
                Coming in Phase 3
              </Text>
            </View>
            <Switch value={false} disabled={true} trackColor={{ false: "#D1D5DB", true: "#4CAF50" }} />
          </View>

          <View className="flex-row items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
            <View>
              <Text className="text-base font-body text-black dark:text-white">
                Dark Mode
              </Text>
              <Text className="text-xs font-body text-gray-400">
                System Default
              </Text>
            </View>
            <Switch value={true} disabled={true} trackColor={{ false: "#D1D5DB", true: "#4CAF50" }} />
          </View>

          <View className="flex-row items-center justify-between py-3">
            <View>
              <Text className="text-base font-body text-black dark:text-white">
                Haptic Feedback
              </Text>
            </View>
            <Switch value={true} disabled={true} trackColor={{ false: "#D1D5DB", true: "#4CAF50" }} />
          </View>
        </Card>

        <Card className="mb-6">
          <Text className="text-lg font-heading text-black dark:text-white mb-4">
            About
          </Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 font-body">Version</Text>
            <Text className="text-black dark:text-white font-body">1.0.0 (Phase 1)</Text>
          </View>
          <View className="flex-row justify-between mb-2">
            <Text className="text-gray-500 font-body">Engine</Text>
            <Text className="text-black dark:text-white font-body">DULA-Core v1.2</Text>
          </View>
        </Card>

        <View className="items-center mt-10">
          <Text className="text-gray-400 text-xs font-body uppercase tracking-widest">
            Handcrafted for Pickleballers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
