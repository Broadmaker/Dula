import { useEffect, Suspense } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SQLiteProvider } from "expo-sqlite";
import { QueryClient, QueryClientProvider, onlineManager } from "@tanstack/react-query";
import NetInfo from "@react-native-community/netinfo";
import { useFonts } from "expo-font";
import { 
  Poppins_400Regular, 
  Poppins_700Bold 
} from "@expo-google-fonts/poppins";
import { 
  Inter_400Regular, 
  Inter_300Light 
} from "@expo-google-fonts/inter";
import { 
  Montserrat_800ExtraBold 
} from "@expo-google-fonts/montserrat";

import { DATABASE_NAME, initDatabase } from "@/services/db/match.db";
import { RootNavigator } from "@/navigation/RootNavigator";
import { OfflineBanner } from "@/components/ui/OfflineBanner";
import { useUIStore } from "@/store/uiStore";
import { logger } from "@/utils/logger";
import "./src/global.css";

// Configure TanStack Query Online Manager
onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

// Initialize Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      retry: 2,
    },
    mutations: {
      retry: 0,
    },
  },
});

export default function App() {
  const setOffline = useUIStore((state) => state.setOffline);

  // Load Fonts
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
    Inter_400Regular,
    Inter_300Light,
    Montserrat_800ExtraBold,
  });

  // Network Listener
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOffline = !state.isConnected;
      setOffline(isOffline);
      if (isOffline) {
        logger.warn("App is offline");
      } else {
        logger.info("App is online");
      }
    });

    return () => unsubscribe();
  }, [setOffline]);

  if (!fontsLoaded) {
    return <LoadingFallback message="Loading fonts..." />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense fallback={<LoadingFallback message="Initializing database..." />}>
        <SQLiteProvider databaseName={DATABASE_NAME} onInit={initDatabase} useSuspense>
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
      <ActivityIndicator size="large" color="#4CAF50" />
      <Text className="mt-4 font-body text-gray-500">{message}</Text>
    </View>
  );
}
