import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { HomeStackParamList } from "@/navigation/types";
import { DashboardScreen } from "@/screens/Home/DashboardScreen";
import { MatchSetupScreen } from "@/screens/Home/MatchSetupScreen";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontFamily: 'Poppins_700Bold' } }}>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="MatchSetup" component={MatchSetupScreen} options={{ title: "New Match" }} />
    </Stack.Navigator>
  );
}
