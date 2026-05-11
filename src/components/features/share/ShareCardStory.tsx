import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ShareCardData } from "@/utils/shareCard";

interface ShareCardStoryProps {
  data: ShareCardData;
}

export const ShareCardStory: React.FC<ShareCardStoryProps> = ({ data }) => {
  return (
    <View style={styles.container} className="bg-primary items-center justify-center p-12">
      {/* Brand Watermark */}
      <View className="absolute top-20 left-12">
        <Text className="text-white/50 font-heading text-lg tracking-[8px] uppercase">
          DULA
        </Text>
      </View>

      {/* Content */}
      <View className="items-center w-full">
        <Text className="text-white font-body text-base uppercase tracking-[6px] mb-4">
          {data.matchType} Match
        </Text>
        
        <Text className="text-white font-heading text-6xl text-center mb-8 leading-tight">
          {data.winnerName}
        </Text>

        <View className="w-24 h-2 bg-secondary rounded-full mb-16" />

        <View className="bg-white/10 px-10 py-12 rounded-[40px] items-center w-full">
          <Text className="text-white font-scoreboard text-8xl mb-4">
            {data.finalScore}
          </Text>
          <View className="items-center">
            <Text className="text-white/90 font-heading text-xl uppercase mb-1" numberOfLines={1}>
              {data.teamAName}
            </Text>
            <Text className="text-secondary font-heading text-sm mb-1">VS</Text>
            <Text className="text-white/90 font-heading text-xl uppercase" numberOfLines={1}>
              {data.teamBName}
            </Text>
          </View>
        </View>
      </View>

      {/* Footer Info */}
      <View className="absolute bottom-20 left-0 right-0 items-center">
        <Text className="text-white/60 font-body text-xs uppercase tracking-widest mb-1">
          {data.date}
        </Text>
        <Text className="text-white/40 font-body text-xs uppercase tracking-widest">
          Match Duration: {data.duration}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 9 / 16,
    width: "100%",
  },
});
