import { View, Text, TouchableOpacity } from "react-native";
import type { MatchStackScreenProps } from "@/navigation/types";

export function MatchSummaryScreen({ navigation, route }: MatchStackScreenProps<"MatchSummary">) {
  const { matchId } = route.params;

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-heading text-primary">Match Summary</Text>
      <Text className="font-body mt-2 text-center">Match ID: {matchId}</Text>
      
      <TouchableOpacity 
        className="mt-6 bg-secondary px-6 py-3 rounded-full"
        onPress={() => navigation.navigate("ShareCard", { matchId, format: "feed" })}
      >
        <Text className="text-white font-heading">Share Result</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        className="mt-4 border border-primary px-6 py-3 rounded-full"
        onPress={() => navigation.navigate("HomeTab", { screen: "Dashboard" })}
      >
        <Text className="text-primary font-heading">Done</Text>
      </TouchableOpacity>
    </View>
  );
}
