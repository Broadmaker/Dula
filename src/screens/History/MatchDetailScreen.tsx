import { View, Text, TouchableOpacity } from "react-native";
import type { HistoryStackScreenProps } from "@/navigation/types";

export function MatchDetailScreen({ navigation, route }: HistoryStackScreenProps<"MatchDetail">) {
  const { matchId } = route.params;

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-heading text-primary">Match Detail</Text>
      <Text className="font-body mt-2">Match ID: {matchId}</Text>
      
      <TouchableOpacity 
        className="mt-6 border border-primary px-6 py-3 rounded-full"
        onPress={() => navigation.goBack()}
      >
        <Text className="text-primary font-heading">Go Back</Text>
      </TouchableOpacity>
    </View>
  );
}
