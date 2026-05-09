import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HistoryStackParamList } from "@/navigation/types";

export function MatchHistoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HistoryStackParamList, "MatchHistory">>();

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
