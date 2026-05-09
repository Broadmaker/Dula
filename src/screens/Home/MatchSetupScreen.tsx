import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList, MainTabParamList } from "@/navigation/types";
import type { CompositeNavigationProp } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, "MatchSetup">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function MatchSetupScreen() {
  const navigation = useNavigation<NavigationProp>();

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
