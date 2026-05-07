import { NavigationContainer } from "@react-navigation/native";
import { MainTabs } from "./tabs/MainTabs";

export function RootNavigator() {
  // Phase 1: No auth gate, mount MainTabs directly
  return (
    <NavigationContainer>
      <MainTabs />
    </NavigationContainer>
  );
}
