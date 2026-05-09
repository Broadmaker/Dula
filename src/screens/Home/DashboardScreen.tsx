import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";

export function DashboardScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList, "Dashboard">>();

  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <Text className="text-2xl font-heading text-primary">Dashboard</Text>
      <Text className="font-body mt-2">Welcome to DULA</Text>
      
      <TouchableOpacity 
        className="mt-6 bg-primary px-6 py-3 rounded-full"
        onPress={() => navigation.navigate("MatchSetup")}
      >
        <Text className="text-white font-heading">Start New Match</Text>
      </TouchableOpacity>
    </View>
  );
}
