# Fix for pushNotificationService.ts TypeScript Errors

## Issues to Fix

1. **Import errors** - Models don't have default exports
2. **Implicit `any` types** - Need to add type annotations

## Fixed Code

Replace your `src/services/pushNotificationService.ts` with this corrected version:

```typescript
// services/pushNotificationService.ts
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";

// Try named export first, fallback to default export
import { User } from "../model/User";
// OR if User uses default export:
// import User from "../model/User";

import { Device } from "../model/Device";
// OR if Device uses default export:
// import Device from "../model/Device";

// If your models use named exports, use:
// import { User } from "../model/User";
// import { Device } from "../model/Device";

// Define types for better type safety
interface UserWithPushToken {
  _id: any;
  pushToken?: string | null;
  pushNotificationsEnabled?: boolean;
}

interface DeviceWithPushToken {
  _id: any;
  pushToken?: string | null;
  userId?: string | null;
}

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

      // Fix: Add type annotation
      const messages: ExpoPushMessage[] = (users as UserWithPushToken[])
        .filter((user: UserWithPushToken) => this.isValidToken(user.pushToken!))
        .map((user: UserWithPushToken) => ({
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

      // Fix: Add type annotation
      const userIds = (users as UserWithPushToken[]).map(
        (user: UserWithPushToken) => user._id.toString()
      );
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

      // Fix: Add type annotations
      const messages: ExpoPushMessage[] = (devices as DeviceWithPushToken[])
        .filter((device: DeviceWithPushToken) =>
          this.isValidToken(device.pushToken!)
        )
        .map((device: DeviceWithPushToken) => ({
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

      // Update last notification sent time for all devices
      await Device.updateMany(
        // Fix: Add type annotation
        { _id: { $in: (devices as DeviceWithPushToken[]).map((d: DeviceWithPushToken) => d._id) } },
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
```

## How to Fix the Import Issue

### Option 1: If your models use named exports

```typescript
// Change from:
import User from "../model/User";
import Device from "../model/Device";

// To:
import { User } from "../model/User";
import { Device } from "../model/Device";
```

### Option 2: If your models use default exports but TypeScript complains

Check your model files. They should export like this:

```typescript
// model/User.ts
export default mongoose.model<IUser>("User", UserSchema);

// OR if using named export:
export const User = mongoose.model<IUser>("User", UserSchema);
```

### Option 3: Use both (most flexible)

```typescript
// Try to import as named, fallback to default
let User: any;
let Device: any;

try {
  const userModule = require("../model/User");
  User = userModule.User || userModule.default;
  
  const deviceModule = require("../model/Device");
  Device = deviceModule.Device || deviceModule.default;
} catch (error) {
  console.error("Error importing models:", error);
}
```

## Quick Fix (Recommended)

The easiest fix is to check your model files and ensure they export correctly. Then update the imports in `pushNotificationService.ts` to match.

If your models are in `src/model/User.ts` and `src/model/Device.ts`, check how they export:

```typescript
// If they export like this:
export const User = mongoose.model(...)
// Then use: import { User } from "../model/User"

// If they export like this:
export default mongoose.model(...)
// Then use: import User from "../model/User"
```

