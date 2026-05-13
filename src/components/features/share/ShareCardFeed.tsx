import React from "react";
import { View, Text } from "react-native";
import type { ShareCardData } from "@/utils/shareCard";

interface ShareCardFeedProps {
  data: ShareCardData;
}

export const ShareCardFeed: React.FC<ShareCardFeedProps> = ({ data }) => {
  return (
    <View className="w-full aspect-square bg-primary items-center justify-center p-10">
      {/* Decorative background elements */}
      <View className="absolute top-[-50] right-[-50] w-64 h-64 rounded-full bg-white/5" />
      <View className="absolute bottom-[-80] left-[-20] w-80 h-80 rounded-full bg-secondary/10" />

      {/* Brand Watermark */}
      <View className="absolute top-8 left-8">
        <Text className="text-white font-heading text-lg tracking-[6px] uppercase">
          DULA
        </Text>
      </View>

      {/* Content */}
      <View className="items-center w-full">
        <View className="bg-white/10 px-4 py-1 rounded-full mb-6">
          <Text className="text-white font-body text-[10px] uppercase tracking-widest">
            {data.matchType} · {data.scoreLimit} Points
          </Text>
        </View>
        
        <View className="flex-row items-center justify-between w-full mb-8">
          {/* Team A */}
          <View className="flex-1 items-center">
            <View className="mb-2">
              <Text className="text-white font-heading text-xl text-center" numberOfLines={2}>
                {data.teamAName}
              </Text>
              {data.isWinnerA && (
                <View className="bg-secondary px-2 py-0.5 rounded mt-1 self-center">
                  <Text className="text-white font-heading text-[8px] uppercase">Winner</Text>
                </View>
              )}
            </View>
            <Text className={`text-7xl font-scoreboard ${data.isWinnerA ? 'text-secondary' : 'text-white'}`}>
              {data.scoreA}
            </Text>
          </View>

          {/* VS Divider */}
          <View className="px-4 items-center">
            <View className="w-[1px] h-12 bg-white/20 mb-2" />
            <Text className="text-white/40 font-heading text-xs italic">VS</Text>
            <View className="w-[1px] h-12 bg-white/20 mt-2" />
          </View>

          {/* Team B */}
          <View className="flex-1 items-center">
            <View className="mb-2">
              <Text className="text-white font-heading text-xl text-center" numberOfLines={2}>
                {data.teamBName}
              </Text>
              {data.isWinnerB && (
                <View className="bg-secondary px-2 py-0.5 rounded mt-1 self-center">
                  <Text className="text-white font-heading text-[8px] uppercase">Winner</Text>
                </View>
              )}
            </View>
            <Text className={`text-7xl font-scoreboard ${data.isWinnerB ? 'text-secondary' : 'text-white'}`}>
              {data.scoreB}
            </Text>
          </View>
        </View>

        <View className="w-full border-t border-white/10 pt-6 items-center">
           <Text className="text-white/80 font-heading text-2xl uppercase tracking-tighter italic">
             {data.winnerName}
           </Text>
        </View>
      </View>

      {/* Footer Info */}
      <View className="absolute bottom-8 left-8 right-8 flex-row justify-between items-end">
        <View>
          <Text className="text-white/40 font-body text-[10px] uppercase">
            {data.date}
          </Text>
          <Text className="text-white/40 font-body text-[10px] uppercase">
            Duration: {data.duration}
          </Text>
        </View>
        <View className="bg-white px-2 py-1 rounded">
           <Text className="text-primary font-heading text-[8px] uppercase">Play with Dula</Text>
        </View>
      </View>
    </View>
  );
};
