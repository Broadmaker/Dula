import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { Alert, Platform } from "react-native";
import { logger } from "@/utils/logger";

/**
 * Capture a view as an image.
 */
export const captureCard = async (viewRef: any): Promise<string | null> => {
  try {
    if (!viewRef) throw new Error("View ref is null");
    
    const uri = await captureRef(viewRef, {
      format: "png",
      quality: 1,
    });
    
    return uri;
  } catch (error) {
    logger.error("Failed to capture share card", error);
    return null;
  }
};

/**
 * Open the native share sheet with the provided image URI.
 */
export const shareImage = async (uri: string) => {
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

/**
 * Save the image to the device's media library.
 */
export const saveToGallery = async (uri: string) => {
  try {
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "We need access to your photos to save the card.");
      return;
    }

    await MediaLibrary.saveToLibraryAsync(uri);
    Alert.alert("Success", "Card saved to your photos!");
  } catch (error) {
    logger.error("Failed to save to gallery", error);
    Alert.alert("Error", "Could not save to photos");
  }
};
