import { View, Text, Switch } from "react-native";
import type { ProfileStackScreenProps } from "@/navigation/types";

export function SettingsScreen() {
  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-2xl font-heading text-primary mb-6">Settings</Text>
      
      <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
        <View>
          <Text className="font-heading">Live Match Sync</Text>
          <Text className="text-xs text-gray-500">Coming soon</Text>
        </View>
        <Switch value={false} disabled={true} />
      </View>

      <View className="mt-auto items-center pb-8">
        <Text className="text-gray-400 text-xs font-body">DULA v1.0.0 (Phase 1)</Text>
      </View>
    </View>
  );
}
