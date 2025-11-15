import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { notificationsApi } from "@/lib/api/notifications";
import { notificationHistoryApi } from "@/lib/api/notification-history";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationConfig {
  title: string;
  body: string;
  data?: any;
  sound?: boolean;
  vibrate?: number[];
}

class NotificationService {
  private lastNotifiedRisk: number | null = null;
  private registeredToken: string | null = null;

  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.warn("Notification permission not granted");
        return false;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("flood-alerts", {
          name: "Flood Alerts",
          description: "High priority flood risk alerts",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF0000",
          sound: "default",
          enableVibrate: true,
          showBadge: true,
        });
      }

      return true;
    } catch (error) {
      console.error("Error requesting notification permissions:", error);
      return false;
    }
  }

  async scheduleFloodAlert(
    floodRisk: number,
    location: string,
    title?: string,
    body?: string,
    authToken?: string
  ): Promise<void> {
    if (floodRisk <= 70) {
      this.lastNotifiedRisk = null;
      return;
    }

    if (this.lastNotifiedRisk === floodRisk) {
      return;
    }

    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn("Cannot send notification: permission not granted");
      return;
    }

    const notificationTitle = title || "High Flood Risk Alert";
    const notificationBody =
      body ||
      `Flood risk is ${floodRisk}% in ${location}. Please stay alert and be prepared.`;

    try {
      const notificationContent: Notifications.NotificationContentInput = {
        title: notificationTitle,
        body: notificationBody,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          type: "flood_alert",
          floodRisk,
          location,
          timestamp: new Date().toISOString(),
        },
      };

      // Add vibration pattern for Android
      if (Platform.OS === "android") {
        notificationContent.vibrate = [0, 250, 250, 250];
      }

      await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // Send immediately
      });

      // Save notification to backend if user is authenticated
      if (authToken) {
        try {
          await notificationHistoryApi.createNotification(authToken, {
            title: notificationTitle,
            body: notificationBody,
            type: "flood_alert",
            data: {
              floodRisk: floodRisk.toString(),
              location,
            },
          });
          console.log("Notification saved to backend history");
        } catch (error) {
          console.error("Failed to save notification to backend:", error);
          // Don't fail the whole operation if backend save fails
        }
      }

      this.lastNotifiedRisk = floodRisk;
      console.log("Flood alert notification sent:", { floodRisk, location });
    } catch (error) {
      console.error("Error sending flood alert notification:", error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  /**
   * Register device for push notifications and send token to backend
   * This enables push notifications that work even when the app is closed
   * @param authToken - User's authentication token (optional, will skip backend registration if not provided)
   * @returns The Expo push token if successful, null otherwise
   */
  async registerForPushNotifications(
    authToken?: string
  ): Promise<string | null> {
    try {
      // Check if device is physical (push notifications don't work on simulators)
      if (!Device.isDevice) {
        console.warn(
          "Push notifications are only supported on physical devices"
        );
        return null;
      }

      // Request permissions
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        console.warn(
          "Cannot register for push notifications: permission not granted"
        );
        return null;
      }

      // Get the Expo push token
      // Note: projectId is required for push notifications
      // In EAS builds, projectId should be available from app.json
      let pushToken: string | null = null;

      // Get projectId from multiple sources (EAS builds, environment, or app.json)
      const projectId =
        process.env.EXPO_PUBLIC_PROJECT_ID ||
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.manifest?.extra?.eas?.projectId ||
        Constants.manifest2?.extra?.eas?.projectId ||
        "57742b45-13a4-4d2c-bcbc-f402c43a91fa"; // Fallback to hardcoded value from app.json

      console.log("Attempting to get push token with projectId:", projectId);

      try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        });
        pushToken = tokenData.data;
        console.log(
          "✅ Push token obtained successfully:",
          pushToken.substring(0, 20) + "..."
        );
      } catch (error: any) {
        console.error("❌ Error getting push token:", error.message || error);
        // Handle missing projectId error gracefully
        if (
          error.message?.includes("projectId") ||
          error.message?.includes("Project ID")
        ) {
          console.warn(
            "⚠️ Push notifications require a projectId. " +
              "Current projectId: " +
              projectId +
              ". " +
              "If using Expo Go, push notifications are limited - use an EAS build for full support."
          );
          return null;
        }
        // Re-throw other errors
        throw error;
      }

      if (!pushToken) {
        return null;
      }

      // Register with backend (authenticated or unauthenticated)
      if (pushToken) {
        try {
          if (authToken) {
            // User is logged in - register with user account
            await notificationsApi.registerPushToken(authToken, pushToken);
            console.log(
              "Push token registered with backend (authenticated):",
              pushToken
            );
          } else {
            // User is not logged in - register as anonymous device
            await notificationsApi.registerPushTokenUnauthenticated(pushToken);
            console.log(
              "Push token registered with backend (unauthenticated):",
              pushToken
            );
          }
          this.registeredToken = pushToken;
        } catch (error) {
          console.error("Failed to register push token with backend:", error);
          // Still return the token even if backend registration fails
          // The user can retry later
        }
      }

      return pushToken;
    } catch (error) {
      console.error("Error registering for push notifications:", error);
      return null;
    }
  }

  /**
   * Unregister push token from backend (e.g., on logout)
   * @param authToken - User's authentication token (optional, will skip API call if not provided)
   */
  async unregisterPushToken(authToken?: string): Promise<void> {
    try {
      if (authToken) {
        await notificationsApi.removePushToken(authToken);
        console.log("Push token unregistered from backend");
      }
      // Always clear local token reference
      this.registeredToken = null;
    } catch (error) {
      console.error("Failed to unregister push token:", error);
      // Still clear local token even if API call fails
      this.registeredToken = null;
    }
  }

  /**
   * Get the currently registered push token
   */
  getRegisteredToken(): string | null {
    return this.registeredToken;
  }
}

export const notificationService = new NotificationService();
