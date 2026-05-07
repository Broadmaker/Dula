import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { MainTabParamList } from "@/navigation/types";
import { HomeStack } from "@/navigation/stacks/HomeStack";
import { MatchStack } from "@/navigation/stacks/MatchStack";
import { HistoryStack } from "@/navigation/stacks/HistoryStack";
import { ProfileStack } from "@/navigation/stacks/ProfileStack";

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarLabelStyle: { fontFamily: 'Inter_400Regular' },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="MatchTab"
        component={MatchStack}
        options={{ title: "Match" }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{ title: "History" }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}
