import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { MatchStackParamList } from "@/navigation/types";

export function ShareCardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MatchStackParamList, "ShareCard">>();
  const [format, setFormat] = useState<"feed" | "story">("feed");

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-heading text-primary">Share Card</Text>
      <Text className="font-body mt-2">Format: {format}</Text>
      
      <View className="flex-row mt-4 space-x-4">
        <TouchableOpacity 
          className={`px-4 py-2 rounded-full ${format === "feed" ? "bg-primary" : "bg-gray-200"}`}
          onPress={() => setFormat("feed")}
        >
          <Text className={format === "feed" ? "text-white" : "text-gray-700"}>Feed (1:1)</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          className={`px-4 py-2 rounded-full ${format === "story" ? "bg-primary" : "bg-gray-200"}`}
          onPress={() => setFormat("story")}
        >
          <Text className={format === "story" ? "text-white" : "text-gray-700"}>Story (9:16)</Text>
        </TouchableOpacity>
      </View>
      
      <View className="mt-8 bg-surface p-6 rounded-lg w-full">
        <Text className="text-white font-scoreboard text-center">SHARE PREVIEW</Text>
      </View>

      <TouchableOpacity 
        className="mt-6 bg-primary px-6 py-3 rounded-full w-full items-center"
        onPress={() => console.log("Sharing...")}
      >
        <Text className="text-white font-heading">Share Image</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="mt-4 px-6 py-3 rounded-full w-full items-center"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-gray-500 font-body">Cancel</Text>
      </TouchableOpacity>
    </View>
  );
}
