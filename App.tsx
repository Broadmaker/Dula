/// <reference types="nativewind/types" />
import "./src/global.css";
import { useEffect, Suspense } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SQLiteProvider } from "expo-sqlite";
import {
  QueryClient,
  QueryClientProvider,
  onlineManager,
} from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { useFonts } from "expo-font";
import {
  Poppins_400Regular,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import { Inter_400Regular, Inter_300Light } from "@expo-google-fonts/inter";
import { Montserrat_800ExtraBold } from "@expo-google-fonts/montserrat";

import { DATABASE_NAME, initDatabase } from "@/services/db/matchDb";
import { RootNavigator } from "@/navigation/RootNavigator";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { useUIStore } from "@/store/uiStore";
import { logger } from "@/utils/logger";
import { colors } from "@/constants/theme";

// TanStack Query onlineManager — wired to NetInfo (GLOBAL.md §9)
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false, // mobile — no window focus
    },
    mutations: {
      retry: 0,
    },
  },
});

// Isolated NetInfo → uiStore wiring — single listener, no duplication
function NetworkListener() {
  const setOffline = useUIStore((s) => s.setOffline);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOffline = !state.isConnected;
      setOffline(isOffline);
      isOffline
        ? logger.warn("Network: offline")
        : logger.info("Network: online");
    });
    return () => unsubscribe();
  }, [setOffline]);

  return null;
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_300Light,
    Montserrat_800ExtraBold,
  });

  if (!fontsLoaded) {
    return <LoadingFallback message="Loading fonts..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={<LoadingFallback message="Initializing database..." />}
      >
        <SQLiteProvider
          databaseName={DATABASE_NAME}
          onInit={initDatabase}
          useSuspense
        >
          <NetworkListener />
          <View className="flex-1">
            <OfflineBanner />
            <RootNavigator />
            <StatusBar style="auto" />
          </View>
        </SQLiteProvider>
      </Suspense>
    </QueryClientProvider>
  );
}

function LoadingFallback({ message }: { message: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text className="mt-4 text-gray-500">{message}</Text>
    </View>
  );
}
