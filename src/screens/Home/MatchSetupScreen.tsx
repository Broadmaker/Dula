import { View, Text, TouchableOpacity } from "react-native";
import type { HomeStackScreenProps } from "@/navigation/types";

export function MatchSetupScreen({ navigation }: HomeStackScreenProps<"MatchSetup">) {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-heading text-primary">Match Setup</Text>
      <Text className="font-body mt-2 text-center">Configure your pickleball match here</Text>
      
      <TouchableOpacity 
        className="mt-6 bg-primary px-6 py-3 rounded-full"
        onPress={() => navigation.navigate("MatchTab", { 
          screen: "LiveScoring", 
          params: { matchId: "new-match-uuid" } 
        })}
      >
        <Text className="text-white font-heading">Start Game</Text>
      </TouchableOpacity>
    </View>
  );
}
