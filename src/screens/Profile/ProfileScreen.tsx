import { View, Text, TouchableOpacity } from "react-native";
import type { ProfileStackScreenProps } from "@/navigation/types";

export function ProfileScreen({ navigation }: ProfileStackScreenProps<"Profile">) {
  return (
    <View className="flex-1 items-center justify-center bg-white p-4">
      <View className="w-24 h-24 bg-primary rounded-full items-center justify-center">
        <Text className="text-white text-3xl font-heading">M</Text>
      </View>
      <Text className="text-2xl font-heading text-primary mt-4">Mark Dev</Text>
      
      <TouchableOpacity 
        className="mt-8 bg-surface p-4 rounded-lg w-full flex-row justify-between"
        onPress={() => navigation.navigate("Settings")}
      >
        <Text className="text-white font-body">Settings</Text>
        <Text className="text-white font-body">></Text>
      </TouchableOpacity>
    </View>
  );
}
