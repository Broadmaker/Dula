import React from "react";
import { View, Text, SafeAreaView } from "react-native";
import { useUIStore } from "@/store/uiStore";

export function OfflineBanner() {
  const isOffline = useUIStore((state) => state.isOffline);

  if (!isOffline) return null;

  return (
    <SafeAreaView className="bg-error w-full">
      <View className="py-2 items-center justify-center">
        <Text className="text-white font-heading text-xs">
          Offline Mode — Changes will sync when connected
        </Text>
      </View>
    </SafeAreaView>
  );
}
