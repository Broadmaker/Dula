import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { ProfileStackParamList } from "@/navigation/types";
import { ProfileScreen } from "@/screens/Profile/ProfileScreen";
import { SettingsScreen } from "@/screens/Profile/SettingsScreen";

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontFamily: 'Poppins_700Bold' } }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
