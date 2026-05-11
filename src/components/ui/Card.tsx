import React from "react";
import { View, ViewProps } from "react-native";

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <View
      className={`bg-white dark:bg-surface rounded-2xl p-4 shadow-sm ${className}`}
      {...props}
    >
      {children}
    </View>
  );
};
