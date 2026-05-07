import { Suspense } from "react";
import { SQLiteProvider } from "expo-sqlite";
import { View, Text, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { DATABASE_NAME, initDatabase } from "@/services/db/match.db";
import "./global.css";

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase} useSuspense>
        <MainApp />
      </SQLiteProvider>
    </Suspense>
  );
}

function MainApp() {
  return (
    <View className="flex-1 items-center justify-center bg-white dark:bg-background-dark">
      <Text className="text-xl font-heading text-primary">DULA</Text>
      <Text className="text-body mt-2">Pickleball Scoring App</Text>
      <StatusBar style="auto" />
    </View>
  );
}

function LoadingFallback() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text className="mt-4 font-body">Initializing...</Text>
    </View>
  );
}
