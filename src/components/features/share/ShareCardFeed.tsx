import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShareCardData } from "@/utils/shareCard";

interface ShareCardFeedProps {
  data: ShareCardData;
}

export const ShareCardFeed: React.FC<ShareCardFeedProps> = ({ data }) => {
  return (
    <View style={styles.container} className="bg-primary items-center justify-center p-8">
      {/* Brand Watermark */}
      <View className="absolute top-6 left-8">
        <Text className="text-white/50 font-heading text-xs tracking-widest uppercase">
          DULA APP
        </Text>
      </View>

      {/* Content */}
      <View className="items-center w-full">
        <Text className="text-white font-body text-sm uppercase tracking-[4px] mb-2">
          {data.matchType} Match
        </Text>
        
        <Text className="text-white font-heading text-4xl text-center mb-6 leading-tight">
          {data.winnerName}
        </Text>

        <View className="w-16 h-1 bg-secondary rounded-full mb-8" />

        <View className="bg-white/10 px-8 py-6 rounded-3xl items-center w-full">
          <Text className="text-white font-scoreboard text-6xl mb-2">
            {data.finalScore}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-white/80 font-body text-xs uppercase" numberOfLines={1}>
              {data.teamAName}
            </Text>
            <Text className="text-secondary font-body mx-2">•</Text>
            <Text className="text-white/80 font-body text-xs uppercase" numberOfLines={1}>
              {data.teamBName}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Info */}
      <View className="absolute bottom-6 right-8 items-end">
        <Text className="text-white/60 font-body text-[10px] uppercase">
          {data.date}
        </Text>
        <Text className="text-white/40 font-body text-[10px] uppercase">
          Duration: {data.duration}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 1,
    width: "100%",
  },
});
