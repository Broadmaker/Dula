import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { HistoryStackParamList } from "@/navigation/types";

export function MatchDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HistoryStackParamList, "MatchDetail">>();
  const route = useRoute<RouteProp<HistoryStackParamList, "MatchDetail">>();
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
