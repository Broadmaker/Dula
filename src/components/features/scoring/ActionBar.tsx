import React from "react";
import { View } from "react-native";
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
    <View className="flex-row items-center justify-between p-4 bg-background dark:bg-background-dark border-t border-gray-200 dark:border-gray-800">
      <Button
        variant="ghost"
        size="sm"
        disabled={!canUndo}
        className="flex-1 mr-2"
        onPress={onUndo}
      >
        Undo
      </Button>
      <Button
        variant="secondary"
        size="sm"
        disabled={!canTimeout}
        className="flex-1 mx-2"
        onPress={onTimeout}
      >
        Timeout
      </Button>
      <Button
        variant="error"
        size="sm"
        className="flex-1 ml-2"
        onPress={onEndMatch}
      >
        End
      </Button>
    </View>
  );
};
