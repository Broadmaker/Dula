import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type {
  RouteProp,
  CompositeNavigationProp,
} from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { useSQLiteContext } from "expo-sqlite";

import type { MatchStackParamList, MainTabParamList } from "@/navigation/types";
import { matchDb } from "@/services/db/matchDb";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Match } from "@/types/match.types";
import { buildShareCardData, ShareCardData } from "@/utils/shareCard";
import { ShareCardFeed } from "@/components/features/share/ShareCardFeed";
import { ShareCardStory } from "@/components/features/share/ShareCardStory";
import * as shareService from "@/services/share/shareCard.service";
import { logger } from "@/utils/logger";

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<MatchStackParamList, "ShareCard">,
  BottomTabNavigationProp<MainTabParamList>
>;

type CardFormat = "feed" | "story";

export function ShareCardScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp<MatchStackParamList, "ShareCard">>();
  const db = useSQLiteContext();

  const { matchId } = route.params;
  const [match, setMatch] = useState<Match | null>(null);
  const [cardData, setCardData] = useState<ShareCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [format, setFormat] = useState<CardFormat>("feed");
  const [isCapturing, setIsCapturing] = useState(false);

  const cardRef = useRef<View>(null);

  useEffect(() => {
    async function loadMatch() {
      try {
        const data = await matchDb(db).getMatchByUuid(matchId);
        if (data) {
          setMatch(data);
          setCardData(buildShareCardData(data));
        }
      } catch (error) {
        logger.error("Failed to load match for share card", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadMatch();
  }, [matchId, db]);

  const handleShare = async () => {
    setIsCapturing(true);
    try {
      const uri = await shareService.captureCard(cardRef);
      if (uri) {
        await shareService.shareImage(uri);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSave = async () => {
    setIsCapturing(true);
    try {
      const uri = await shareService.captureCard(cardRef);
      if (uri) {
        await shareService.saveToGallery(uri);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  if (isLoading) return <LoadingSpinner fullScreen />;

  if (!match || !cardData) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white dark:bg-[#121212] p-4">
        <Text className="text-xl font-heading text-error">Match not found</Text>
        <Button className="mt-6" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#121212]">
      <ScrollView className="flex-1" contentContainerStyle={{ padding: 20 }}>
        <Text className="text-3xl font-heading text-black dark:text-white mb-6">
          Share Card
        </Text>

        {/* Format Toggle */}
        <View className="flex-row mb-8 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
          {(["feed", "story"] as CardFormat[]).map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setFormat(f)}
              className={`flex-1 py-3 rounded-xl items-center ${
                format === f ? "bg-white dark:bg-surface shadow-sm" : ""
              }`}
            >
              <Text
                className={`font-heading capitalize ${
                  format === f ? "text-primary" : "text-gray-400"
                }`}
              >
                {f} (1:{f === "feed" ? "1" : "16/9"})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Preview Container */}
        <View className="mb-10 items-center justify-center">
          <Text className="text-xs font-body text-gray-400 uppercase tracking-widest mb-4">
            Preview
          </Text>

          <View
            className="w-full shadow-2xl overflow-hidden rounded-3xl bg-primary"
            style={{
              elevation: 10,
              // For "story" we need to scale down the preview to fit screen
              maxHeight: format === "story" ? 450 : undefined,
            }}
          >
            {/* The actual view we capture */}
            <View ref={cardRef} collapsable={false}>
              {format === "feed" ? (
                <ShareCardFeed data={cardData} />
              ) : (
                <ShareCardStory data={cardData} />
              )}
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="mt-auto">
          <Button
            variant="primary"
            size="lg"
            className="mb-4"
            isLoading={isCapturing}
            onPress={handleShare}
          >
            Share to Social
          </Button>

          <Button
            variant="secondary"
            size="lg"
            isLoading={isCapturing}
            onPress={handleSave}
          >
            Save to Gallery
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
