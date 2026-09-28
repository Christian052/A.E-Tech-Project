import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { getSecureItem, setSecureItem } from "./secureStorage";
import api from "../api/client";

const PUSH_TOKEN_KEY = "augu_mobile_push_token";

/**
 * Configure global foreground notification behavior.
 * When the app is open, show an alert banner, play sound, and badge count.
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register device with Expo Notification service and obtain push token.
 * Safely handles physical devices vs simulators/emulators and web fallback.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  // Notification channels for Android Oreo+
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("service-requests", {
      name: "Service & Repair Updates",
      description: "Alerts for incoming service inquiries, technician updates, and status changes.",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#0D9488",
    });
  }

  // Device check: Push notifications require a physical device or compatible simulator
  if (Device.isDevice || Platform.OS !== "web") {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("[Notifications] Push notification permission was not granted.");
      return null;
    }

    try {
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        // Uses project ID configured in app.json if present
      });
      token = pushTokenData.data;
      if (token) {
        await setSecureItem(PUSH_TOKEN_KEY, token);
      }
    } catch (e: any) {
      console.log("[Notifications] getExpoPushTokenAsync notice (simulators may not support remote tokens):", e?.message);
    }
  } else {
    console.log("[Notifications] Must use physical device for remote push notifications.");
  }

  return token;
}

/**
 * Get stored Expo Push Token
 */
export async function getStoredPushToken(): Promise<string | null> {
  return getSecureItem(PUSH_TOKEN_KEY);
}

/**
 * Schedule a local instant alert on the mobile device for incoming service request updates.
 * Used when backend sends updates or webhooks.
 */
export async function triggerLocalServiceAlert(title: string, body: string, data: Record<string, any> = {}) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data,
      sound: "default",
      color: "#0D9488",
    },
    trigger: null, // deliver immediately
  });
}
