import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";

interface ActionBarProps {
  onUndo: () => void;
  onTimeout: () => void;
  onEndMatch: () => void;
  canUndo: boolean;
  canTimeout: boolean;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  onUndo,
  onTimeout,
  onEndMatch,
  canUndo,
  canTimeout,
}) => {
  return (
    <View className="bg-white dark:bg-surface border-t border-gray-100 dark:border-gray-800/50 shadow-2xl">
      <SafeAreaView edges={["bottom"]}>
        <View className="flex-row items-center justify-between p-4 gap-3">
          <Button
            variant="ghost"
            size="md"
            disabled={!canUndo}
            className="flex-1 border-gray-200 dark:border-gray-700"
            onPress={onUndo}
          >
            Undo
          </Button>

          <Button
            variant="secondary"
            size="md"
            disabled={!canTimeout}
            className="flex-1"
            onPress={onTimeout}
          >
            Timeout
          </Button>

          <Button
            variant="error"
            size="md"
            className="flex-1"
            onPress={onEndMatch}
          >
            End Match
          </Button>
        </View>
      </SafeAreaView>
    </View>
  );
};
