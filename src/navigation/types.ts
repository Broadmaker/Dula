import type { NavigatorScreenParams } from "@react-navigation/native";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type HomeStackParamList = {
  Dashboard: undefined;
  MatchSetup: undefined;
};

export type MatchStackParamList = {
  LiveScoring: { matchId: string };
  MatchSummary: { matchId: string };
  ShareCard: { matchId: string };
};

export type HistoryStackParamList = {
  MatchHistory: undefined;
  MatchDetail: { matchId: string };
};

export type AnalyticsStackParamList = {
  AnalyticsDashboard: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
};

export type MainTabParamList = {
  HomeTab:      NavigatorScreenParams<HomeStackParamList>;
  MatchTab:     NavigatorScreenParams<MatchStackParamList>;
  HistoryTab:   NavigatorScreenParams<HistoryStackParamList>;
  AnalyticsTab: NavigatorScreenParams<AnalyticsStackParamList>;
  ProfileTab:   NavigatorScreenParams<ProfileStackParamList>;
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
};