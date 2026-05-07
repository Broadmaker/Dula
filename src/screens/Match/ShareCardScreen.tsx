import { View, Text, TouchableOpacity } from "react-native";
import type { MatchStackScreenProps } from "@/navigation/types";

export function ShareCardScreen({ navigation, route }: MatchStackScreenProps<"ShareCard">) {
  const { matchId, format } = route.params;

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-heading text-primary">Share Card</Text>
      <Text className="font-body mt-2">Format: {format}</Text>
      
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
