import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { HistoryStackParamList } from "@/navigation/types";
import { MatchHistoryScreen } from "@/screens/History/MatchHistoryScreen";
import { MatchDetailScreen } from "@/screens/History/MatchDetailScreen";

const Stack = createNativeStackNavigator<HistoryStackParamList>();

export function HistoryStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontFamily: 'Poppins_700Bold' } }}>
      <Stack.Screen name="MatchHistory" component={MatchHistoryScreen} options={{ title: "History" }} />
      <Stack.Screen name="MatchDetail" component={MatchDetailScreen} options={{ title: "Match Result" }} />
    </Stack.Navigator>
  );
}
