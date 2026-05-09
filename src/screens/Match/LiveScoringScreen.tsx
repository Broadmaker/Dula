import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp, CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { MatchStackParamList, MainTabParamList } from "@/navigation/types";
import { useActiveMatchStore } from "@/store/activeMatchStore";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MatchStackParamList, "LiveScoring">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function LiveScoringScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MatchStackParamList, "LiveScoring">>();

  const storeMatchId = useActiveMatchStore((state) => state.matchId);
  const matchId = route.params?.matchId || storeMatchId;

  if (!matchId) {
    return (
      <View className="flex-1 items-center justify-center bg-white p-4">
        <Text className="text-2xl font-heading text-primary">No Active Match</Text>
        <Text className="font-body mt-2 text-center">
          You haven&apos;t started a match yet. Go to the Home tab to start one!
        </Text>
        <TouchableOpacity
          className="mt-6 bg-primary px-6 py-3 rounded-full"
          onPress={() => navigation.navigate("HomeTab", { screen: "Dashboard" })}
        >
          <Text className="text-white font-heading">Go to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
