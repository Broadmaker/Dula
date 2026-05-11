import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  type TouchableOpacityProps,
} from "react-native";
import { colors } from "@/constants/theme";

interface ButtonProps extends TouchableOpacityProps {
  variant?: "primary" | "secondary" | "ghost" | "error";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  disabled,
  className = "",
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-surface border border-primary";
      case "ghost":
        return "bg-transparent border border-primary";
      case "error":
        return "bg-error";
      case "primary":
      default:
        return "bg-primary";
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case "ghost":
      case "secondary":
        return "text-primary";
      default:
        return "text-white";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "px-3 py-2";
      case "lg":
        return "px-8 py-4";
      default:
        return "px-6 py-3";
    }
  };

  const getLabelSizeClasses = () => {
    switch (size) {
      case "sm":
        return "text-sm";
      case "lg":
        return "text-lg";
      default:
        return "text-base";
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || isLoading}
      accessibilityRole="button"
      accessibilityLabel={typeof children === "string" ? children : undefined}
      accessibilityState={{ disabled: !!(disabled || isLoading) }}
      className={`
        rounded-xl flex-row items-center justify-center
        ${getVariantClasses()}
        ${getSizeClasses()}
        ${disabled || isLoading ? "opacity-50" : ""}
        ${className}
      `.trim()}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={
            variant === "ghost" || variant === "secondary"
              ? colors.primary
              : colors.onPrimary
          }
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && <View>{icon}</View>}
          <Text
            className={`font-heading text-center ${getTextClasses()} ${getLabelSizeClasses()}`}
          >
            {children}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
