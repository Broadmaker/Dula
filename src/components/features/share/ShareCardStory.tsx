import React from "react";
import { View, Text } from "react-native";
import type { ShareCardData } from "@/utils/shareCard";

interface ShareCardStoryProps {
  data: ShareCardData;
}

export const ShareCardStory: React.FC<ShareCardStoryProps> = ({ data }) => {
  return (
    <View className="w-full aspect-[9/16] bg-primary items-center justify-between p-16">
      {/* Decorative background elements */}
      <View className="absolute top-[-100] left-[-100] w-[400] h-[400] rounded-full bg-white/5" />
      <View className="absolute bottom-[10%] right-[-50] w-64 h-64 rounded-full bg-secondary/10" />

      {/* Brand Watermark */}
      <View className="w-full">
        <Text className="text-white font-heading text-2xl tracking-[10px] uppercase text-center">
          DULA
        </Text>
      </View>

      {/* Content */}
      <View className="items-center w-full">
        <View className="bg-white/10 px-6 py-2 rounded-full mb-12">
          <Text className="text-white font-body text-xs uppercase tracking-[4px]">
            {data.matchType} Match
          </Text>
        </View>
        
        {/* Team A */}
        <View className="items-center mb-8">
          <Text className="text-white font-heading text-2xl text-center uppercase tracking-tight mb-2">
            {data.teamAName}
          </Text>
          <Text className={`text-9xl font-scoreboard ${data.isWinnerA ? 'text-secondary' : 'text-white'}`}>
            {data.scoreA}
          </Text>
        </View>

        <View className="flex-row items-center justify-center w-full mb-8">
          <View className="h-[1px] flex-1 bg-white/20" />
          <Text className="text-white/40 font-heading text-sm italic mx-4">VS</Text>
          <View className="h-[1px] flex-1 bg-white/20" />
        </View>

        {/* Team B */}
        <View className="items-center">
          <Text className={`text-9xl font-scoreboard ${data.isWinnerB ? 'text-secondary' : 'text-white'}`}>
            {data.scoreB}
          </Text>
          <Text className="text-white font-heading text-2xl text-center uppercase tracking-tight mt-2">
            {data.teamBName}
          </Text>
        </View>
      </View>

      {/* Footer Info */}
      <View className="items-center w-full">
        <View className="bg-secondary px-4 py-1 rounded-full mb-4">
           <Text className="text-white font-heading text-[10px] uppercase tracking-widest">
             {data.winnerName}
           </Text>
        </View>
        <Text className="text-white/60 font-body text-xs uppercase tracking-[2px]">
          {data.date}
        </Text>
        <Text className="text-white/40 font-body text-[10px] uppercase mt-2">
          Duration: {data.duration}
        </Text>
        
        <View className="mt-12 bg-white px-4 py-2 rounded-xl">
           <Text className="text-primary font-heading text-xs uppercase">Join the Court · DULA APP</Text>
        </View>
      </View>
    </View>
  );
};
