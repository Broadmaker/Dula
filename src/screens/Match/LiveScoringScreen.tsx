import { View, Text, TouchableOpacity } from "react-native";
import type { MatchStackScreenProps } from "@/navigation/types";

export function LiveScoringScreen({ navigation, route }: MatchStackScreenProps<"LiveScoring">) {
  const { matchId } = route.params;

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-heading text-primary">Live Scoring</Text>
      <Text className="font-body mt-2">Match ID: {matchId}</Text>
      
      <TouchableOpacity 
        className="mt-6 bg-primary px-6 py-3 rounded-full"
        onPress={() => navigation.navigate("MatchSummary", { matchId })}
      >
        <Text className="text-white font-heading">End Match</Text>
      </TouchableOpacity>
    </View>
  );
}
