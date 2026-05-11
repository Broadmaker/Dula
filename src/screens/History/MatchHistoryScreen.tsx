import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, RefreshControl, SafeAreaView } from "react-native";
import { useNavigation, CompositeNavigationProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";

import type { HistoryStackParamList, MainTabParamList } from "@/navigation/types";
import { matchDb } from "@/services/db/matchDb";
import { MatchCard } from "@/components/features/matches/MatchCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Match } from "@/types/match.types";
import { logger } from "@/utils/logger";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<HistoryStackParamList, "MatchHistory">,
  BottomTabNavigationProp<MainTabParamList>
>;

export function MatchHistoryScreen() {
  const navigation = useNavigation<NavigationProp>();
  const db = useSQLiteContext();

  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isError, setIsError] = useState(false);

  const loadMatches = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setIsRefreshing(true);
    else setIsLoading(true);
    
    setIsError(false);

    try {
      const data = await matchDb(db).getAllMatches();
      setMatches(data);
    } catch (error) {
      logger.error("Failed to load match history", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [db]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // Reload when navigating back to this screen
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadMatches();
    });
    return unsubscribe;
  }, [navigation, loadMatches]);

  const handleMatchPress = (match: Match) => {
    navigation.navigate("MatchDetail", { matchId: match.uuid });
  };

  if (isLoading && !isRefreshing) {
    return <LoadingSpinner fullScreen />;
  }

  if (isError) {
    return (
      <ErrorState
        message="Failed to load your match history"
        onRetry={() => loadMatches()}
      />
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background dark:bg-background-dark">
      <View className="flex-1">
        <FlatList
          data={matches}
          keyExtractor={(item) => item.uuid}
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          ListHeaderComponent={
            <Text className="text-3xl font-heading text-black dark:text-white mb-6">
              Match History
            </Text>
          }
          renderItem={({ item }) => (
            <MatchCard match={item} onPress={handleMatchPress} />
          )}
          ListEmptyComponent={
            <EmptyState
              title="No matches found"
              message="Your completed matches will appear here. Start a game to build your history!"
              actionLabel="Start a Match"
              onAction={() => navigation.navigate("HomeTab", { screen: "MatchSetup" })}
            />
          }
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => loadMatches(true)}
              tintColor="#4CAF50"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}
