// services/pushNotificationService.ts
// FIXED VERSION - Copy this to your backend

import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

// FIX 1: Use named exports instead of default exports
import { User } from "../model/User";
import { Device } from "../model/Device";

// If your models use default exports, uncomment this instead:
// import User from "../model/User";
// import Device from "../model/Device";

class PushNotificationService {
  private expo: Expo;

  constructor() {
    this.expo = new Expo();
  }

  /**
   * Validate if a token is a valid Expo push token
   */
  isValidToken(token: string): boolean {
    return Expo.isExpoPushToken(token);
  }

  /**
   * Send a push notification to a single user
   */
  async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<boolean> {
    try {
      const user = await User.findById(userId);

      if (!user || !user.pushToken || !user.pushNotificationsEnabled) {
        console.log(
          `User ${userId} has no push token or notifications disabled`
        );
        return false;
      }

      if (!this.isValidToken(user.pushToken)) {
        console.error(`Invalid push token for user ${userId}`);
        return false;
      }

      const message: ExpoPushMessage = {
        to: user.pushToken,
        sound: "default",
        title,
        body,
        data: {
          ...data,
          timestamp: new Date().toISOString(),
        },
        priority: "high",
        channelId: "flood-alerts",
        badge: 1,
      };

      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending push notification chunk:", error);
          return false;
        }
      }

      await User.findByIdAndUpdate(userId, {
        lastNotificationSentAt: new Date(),
      });

      this.handleTicketErrors(tickets);

      return true;
    } catch (error) {
      console.error(
        `Error sending push notification to user ${userId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(
    userIds: string[],
    title: string,
    body: string,
    data?: any
  ): Promise<{ success: number; failed: number }> {
    try {
      const users = await User.find({
        _id: { $in: userIds },
        pushToken: { $exists: true, $ne: null },
        pushNotificationsEnabled: true,
      });

      if (users.length === 0) {
        return { success: 0, failed: 0 };
      }

      // FIX 2: Add explicit type annotations to fix implicit 'any' errors
      const messages: ExpoPushMessage[] = users
        .filter((user: any) => this.isValidToken(user.pushToken!))
        .map((user: any) => ({
          to: user.pushToken!,
          sound: "default",
          title,
          body,
          data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
          priority: "high",
          channelId: "flood-alerts",
          badge: 1,
        }));

      if (messages.length === 0) {
        return { success: 0, failed: 0 };
      }

      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending push notification chunk:", error);
        }
      }

      await User.updateMany(
        { _id: { $in: userIds } },
        { lastNotificationSentAt: new Date() }
      );

      const results = this.handleTicketErrors(tickets);

      return {
        success: results.success,
        failed: results.failed,
      };
    } catch (error) {
      console.error("Error sending push notifications to users:", error);
      return { success: 0, failed: userIds.length };
    }
  }

  /**
   * Send flood alert notification
   */
  async sendFloodAlert(
    userId: string,
    floodRisk: number,
    location: string
  ): Promise<boolean> {
    const title = "High Flood Risk Alert";
    const body = `Flood risk is ${floodRisk}% in ${location}. Please stay alert and be prepared.`;

    return this.sendToUser(userId, title, body, {
      type: "flood_alert",
      floodRisk,
      location,
    });
  }

  /**
   * Handle ticket errors and retry logic
   */
  private handleTicketErrors(tickets: ExpoPushTicket[]): {
    success: number;
    failed: number;
  } {
    let success = 0;
    let failed = 0;

    tickets.forEach((ticket) => {
      if (ticket.status === "ok") {
        success++;
      } else if (ticket.status === "error") {
        failed++;
        console.error("Push notification error:", ticket.message);

        if (ticket.details?.error === "DeviceNotRegistered") {
          console.log("Device not registered - token may be invalid");
        }
      }
    });

    return { success, failed };
  }

  /**
   * Send notification to users in a specific location
   */
  async sendToLocation(
    city: string,
    township: string,
    title: string,
    body: string,
    data?: any
  ): Promise<{ success: number; failed: number }> {
    try {
      const users = await User.find({
        city,
        township,
        pushToken: { $exists: true, $ne: null },
        pushNotificationsEnabled: true,
      });

      // FIX 3: Add explicit type annotation
      const userIds = users.map((user: any) => user._id.toString());
      return this.sendToUsers(userIds, title, body, data);
    } catch (error) {
      console.error("Error sending notifications to location:", error);
      return { success: 0, failed: 0 };
    }
  }

  /**
   * Send notification to all devices (including anonymous)
   */
  async sendToAllDevices(
    title: string,
    body: string,
    data?: any
  ): Promise<{ success: number; failed: number }> {
    try {
      // Get all devices (authenticated and anonymous)
      const devices = await Device.find({
        pushToken: { $exists: true, $ne: null },
      });

      if (devices.length === 0) {
        return { success: 0, failed: 0 };
      }

      // FIX 4: Add explicit type annotations for device parameters
      const messages: ExpoPushMessage[] = devices
        .filter((device: any) => this.isValidToken(device.pushToken!))
        .map((device: any) => ({
          to: device.pushToken!,
          sound: "default",
          title,
          body,
          data: {
            ...data,
            timestamp: new Date().toISOString(),
          },
          priority: "high",
          channelId: "flood-alerts",
          badge: 1,
        }));

      if (messages.length === 0) {
        return { success: 0, failed: 0 };
      }

      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending push notification chunk:", error);
        }
      }

      // FIX 5: Add explicit type annotation for the map function
      await Device.updateMany(
        { _id: { $in: devices.map((d: any) => d._id) } },
        { updatedAt: new Date() }
      );

      const results = this.handleTicketErrors(tickets);

      return {
        success: results.success,
        failed: results.failed,
      };
    } catch (error) {
      console.error("Error sending notifications to all devices:", error);
      return { success: 0, failed: 0 };
    }
  }
}

export default new PushNotificationService();
