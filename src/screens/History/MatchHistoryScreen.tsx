import { View, Text, TouchableOpacity } from "react-native";
import type { HistoryStackScreenProps } from "@/navigation/types";

export function MatchHistoryScreen({ navigation }: HistoryStackScreenProps<"MatchHistory">) {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-heading text-primary">Match History</Text>
      <Text className="font-body mt-2 text-center">List of your past pickleball battles</Text>
      
      <TouchableOpacity 
        className="mt-6 bg-surface p-4 rounded-lg w-full"
        onPress={() => navigation.navigate("MatchDetail", { matchId: "past-match-uuid" })}
      >
        <Text className="text-white font-heading">Recent Match: 11 - 8</Text>
      </TouchableOpacity>
    </View>
  );
}
