import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import type { CompositeScreenProps, NavigatorScreenParams } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

/**
 * Auth Stack (Phase 2+)
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

/**
 * Home Stack
 */
export type HomeStackParamList = {
  Dashboard: undefined;
  MatchSetup: undefined;
};

/**
 * Match Stack
 */
export type MatchStackParamList = {
  LiveScoring: { matchId: string };
  MatchSummary: { matchId: string };
  ShareCard: { matchId: string; format: "feed" | "story" };
};

/**
 * History Stack
 */
export type HistoryStackParamList = {
  MatchHistory: undefined;
  MatchDetail: { matchId: string };
};

/**
 * Profile Stack
 */
export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

/**
 * Main Tabs
 */
export type MainTabParamList = {
  HomeTab: NavigatorScreenParams<HomeStackParamList>;
  MatchTab: NavigatorScreenParams<MatchStackParamList>;
  HistoryTab: NavigatorScreenParams<HistoryStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

/**
 * Helper types for screens
 */
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};

export type MainTabScreenProps<T extends keyof MainTabParamList> = BottomTabScreenProps<
  MainTabParamList,
  T
>;

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, T>,
  MainTabScreenProps<"HomeTab">
>;

export type MatchStackScreenProps<T extends keyof MatchStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<MatchStackParamList, T>,
  MainTabScreenProps<"MatchTab">
>;

export type HistoryStackScreenProps<T extends keyof HistoryStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<HistoryStackParamList, T>,
  MainTabScreenProps<"HistoryTab">
>;

export type ProfileStackScreenProps<T extends keyof ProfileStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<ProfileStackParamList, T>,
  MainTabScreenProps<"ProfileTab">
>;
