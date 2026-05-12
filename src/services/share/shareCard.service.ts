import type { RefObject } from "react";
import type { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Alert } from "react-native";
import { logger } from "@/utils/logger";

export const captureCard = async (
  viewRef: RefObject<View | null>  // ← add | null
): Promise<string | null> => {
  try {
    if (!viewRef.current) throw new Error("View ref is null");
    const uri = await captureRef(viewRef.current, {
      format: "png",
      quality: 1,
    });
    return uri;
  } catch (error) {
    logger.error("Failed to capture share card", error);
    return null;
  }
};

export const shareImage = async (uri: string): Promise<void> => {
  try {
    const isAvailable = await Sharing.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert("Error", "Sharing is not available on this device");
      return;
    }
    await Sharing.shareAsync(uri, {
      mimeType: "image/png",
      dialogTitle: "Share Match Result",
      UTI: "public.png",
    });
  } catch (error) {
    logger.error("Failed to share image", error);
    Alert.alert("Error", "Could not open share sheet");
  }
};

export const saveToGallery = async (uri: string): Promise<void> => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "We need access to your photos to save the card."
      );
      return;
    }
    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert("Saved!", "Match card saved to your photos.");
  } catch (error) {
    logger.error("Failed to save to gallery", error);
    Alert.alert("Error", "Could not save to photos");
  }
};