import { createNativeStackNavigator } from "@react-navigation/native-stack";
import type { MatchStackParamList } from "@/navigation/types";
import { LiveScoringScreen } from "@/screens/Match/LiveScoringScreen";
import { MatchSummaryScreen } from "@/screens/Match/MatchSummaryScreen";
import { ShareCardScreen } from "@/screens/Match/ShareCardScreen";

const Stack = createNativeStackNavigator<MatchStackParamList>();

export function MatchStack() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleStyle: { fontFamily: 'Poppins_700Bold' } }}>
      <Stack.Screen name="LiveScoring" component={LiveScoringScreen} options={{ title: "Scoring" }} />
      <Stack.Screen name="MatchSummary" component={MatchSummaryScreen} options={{ title: "Summary" }} />
      <Stack.Screen name="ShareCard" component={ShareCardScreen} options={{ title: "Share Result" }} />
    </Stack.Navigator>
  );
}
