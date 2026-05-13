import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { CompositeNavigationProp } from "@react-navigation/native";
import { useSQLiteContext } from "expo-sqlite";

import type {
  HistoryStackParamList,
  MainTabParamList,
} from "@/navigation/types";
import { matchDb } from "@/services/db/matchDb";
import { MatchCard } from "@/components/features/matches/MatchCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import type { Match } from "@/types/match.types";
import { logger } from "@/utils/logger";
import { colors } from "@/constants/theme";

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

  const loadMatches = useCallback(
    async (showRefreshing = false) => {
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
    },
    [db],
  );

  // Single load mechanism — focus fires on mount AND on return navigation
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
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <FlatList
        data={matches}
        keyExtractor={(item) => item.uuid}
        contentContainerStyle={{ padding: 24, paddingBottom: 100 }}
        ListHeaderComponent={
          <View className="mb-8">
            <Text className="text-3xl font-heading text-black dark:text-white">
              History
            </Text>
            <Text className="text-sm font-body text-gray-400 mt-1">
              {matches.length} {matches.length === 1 ? "match" : "matches"}{" "}
              played
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <MatchCard match={item} onPress={handleMatchPress} />
        )}
        ListEmptyComponent={
          <View className="mt-20">
            <EmptyState
              title="No matches yet"
              message="Your match results and statistics will appear here. Hit the court to get started!"
              actionLabel="Start a Match"
              onAction={() =>
                navigation.navigate("HomeTab", { screen: "Dashboard" })
              }
            />
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadMatches(true)}
            tintColor={colors.primary}
            colors={[colors.primary]} // Android
          />
        }
      />
    </SafeAreaView>
  );
}
