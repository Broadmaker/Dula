import React from "react";
import { View, Text, FlatList } from "react-native";
import {
  useNavigation,
  CompositeNavigationProp,
} from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { useMatchMock } from "@/hooks/useMatchMock";
import { MatchCard } from "@/components/features/matches/MatchCard";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Match } from "@/types/match.types";
import type { MainTabParamList, HomeStackParamList } from "@/navigation/types";

type DashboardNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, "Dashboard">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function DashboardScreen() {
  const navigation = useNavigation<DashboardNavigationProp>();
  const { data: matches, isLoading, isError } = useMatchMock();

  const handleMatchPress = (match: Match) => {
    if (match.status === "active") {
      // Navigate to MatchTab -> LiveScoring
      navigation.navigate("MatchTab", {
        screen: "LiveScoring",
        params: { matchId: match.uuid },
      });
    } else {
      // Navigate to HistoryTab -> MatchDetail
      navigation.navigate("HistoryTab", {
        screen: "MatchDetail",
        params: { matchId: match.uuid },
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load recent matches"
        onRetry={() => {
          /* In a real app, this would trigger a refetch */
        }}
      />
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-[#121212]">
      <FlatList
        data={matches}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <View className="mb-6">
            <Text className="text-3xl font-heading text-black dark:text-white mb-2">
              Hello, Player!
            </Text>
            <Text className="text-base font-body text-gray-500 dark:text-gray-400">
              Ready for your next match?
            </Text>

            <Button
              className="mt-6"
              onPress={() => navigation.navigate("MatchSetup")}
            >
              Start New Match
            </Button>

            <Text className="text-xl font-heading text-black dark:text-white mt-10 mb-4">
              Recent Matches
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MatchCard match={item} onPress={handleMatchPress} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="No matches yet"
            message="Your match history will appear here once you've completed some games."
            actionLabel="Start your first match"
            onAction={() => navigation.navigate("MatchSetup")}
          />
        }
      />
    </View>
  );
}
