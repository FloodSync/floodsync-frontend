# Backend Push Notifications Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Database Schema](#database-schema)
5. [API Endpoints](#api-endpoints)
6. [Push Notification Service](#push-notification-service)
7. [Background Jobs & Scheduled Tasks](#background-jobs--scheduled-tasks)
8. [Error Handling & Token Management](#error-handling--token-management)
9. [Testing](#testing)
10. [Production Considerations](#production-considerations)

---

## Overview

This guide provides a complete implementation for push notifications in your Express + TypeScript + MongoDB backend. The system enables sending push notifications to mobile devices even when the app is closed, using Expo Push Notification Service.

### Key Features

- ✅ Device token registration and storage
- ✅ Sending push notifications to individual users
- ✅ Batch notification sending
- ✅ Background job for automated flood alerts
- ✅ Token validation and cleanup
- ✅ Error handling and retry logic

---

## Prerequisites

- Express.js backend with TypeScript
- MongoDB database
- User authentication system (JWT tokens)
- Node.js 16+ installed

---

## Installation & Setup

### Step 1: Install Required Dependencies

```bash
npm install expo-server-sdk
npm install --save-dev @types/node-cron
npm install node-cron  # Optional: for scheduled jobs
```

### Step 2: Environment Variables

Add to your `.env` file:

```env
# Expo Push Notification Service (no API key needed for basic usage)
# The expo-server-sdk works without authentication for basic push notifications

# Optional: For production, you might want to configure:
NODE_ENV=production
```

---

## Database Schema

### User Model Update

Add push notification fields to your existing User model:

```typescript
// models/User.ts or similar
import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  // ... existing fields
  email: string;
  password: string;
  name: string;
  // ... other fields

  // Push Notification Fields
  pushToken?: string;
  pushTokenUpdatedAt?: Date;
  pushNotificationsEnabled?: boolean;
  lastNotificationSentAt?: Date;

  // Location for flood alerts
  city?: string;
  township?: string;
  latitude?: number;
  longitude?: number;
}

const UserSchema = new Schema<IUser>(
  {
    // ... existing schema fields
    pushToken: {
      type: String,
      default: null,
      index: true, // Index for faster queries
    },
    pushTokenUpdatedAt: {
      type: Date,
      default: null,
    },
    pushNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    lastNotificationSentAt: {
      type: Date,
      default: null,
    },
    city: String,
    township: String,
    latitude: Number,
    longitude: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IUser>("User", UserSchema);
```

---

## API Endpoints

### 1. Register/Update Push Token

**Endpoint:** `POST /api/v1/user/push-token`

**Description:** Registers or updates a user's push notification token.

**Authentication:** Required (Bearer token)

**Request Body:**

```json
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

**Implementation:**

```typescript
// routes/user.ts or similar
import { Request, Response } from "express";
import User from "../models/User";
import { authenticate } from "../middleware/auth"; // Your auth middleware

export const registerPushToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id; // From your auth middleware
    const { pushToken } = req.body;

    if (!pushToken) {
      return res.status(400).json({
        success: false,
        message: "Push token is required",
      });
    }

    // Validate Expo push token format
    if (
      !pushToken.startsWith("ExponentPushToken[") &&
      !pushToken.startsWith("ExpoPushToken[")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid push token format",
      });
    }

    // Update user with push token
    await User.findByIdAndUpdate(
      userId,
      {
        pushToken,
        pushTokenUpdatedAt: new Date(),
        pushNotificationsEnabled: true,
      },
      { new: true }
    );

    res.json({
      success: true,
      message: "Push token registered successfully",
    });
  } catch (error: any) {
    console.error("Error registering push token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register push token",
      error: error.message,
    });
  }
};

// Add to your router
router.post("/push-token", authenticate, registerPushToken);
```

### 2. Remove Push Token (Logout/Disable)

**Endpoint:** `DELETE /api/v1/user/push-token`

**Description:** Removes a user's push token (e.g., on logout).

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "message": "Push token removed successfully"
}
```

**Implementation:**

```typescript
export const removePushToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    await User.findByIdAndUpdate(userId, {
      pushToken: null,
      pushTokenUpdatedAt: null,
      pushNotificationsEnabled: false,
    });

    res.json({
      success: true,
      message: "Push token removed successfully",
    });
  } catch (error: any) {
    console.error("Error removing push token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove push token",
      error: error.message,
    });
  }
};

router.delete("/push-token", authenticate, removePushToken);
```

### 3. Toggle Push Notifications

**Endpoint:** `PATCH /api/v1/user/push-notifications`

**Description:** Enable or disable push notifications for a user.

**Authentication:** Required

**Request Body:**

```json
{
  "enabled": true
}
```

**Implementation:**

```typescript
export const togglePushNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const { enabled } = req.body;

    await User.findByIdAndUpdate(userId, {
      pushNotificationsEnabled: enabled !== false,
    });

    res.json({
      success: true,
      message: `Push notifications ${enabled ? "enabled" : "disabled"}`,
    });
  } catch (error: any) {
    console.error("Error toggling push notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update push notification settings",
      error: error.message,
    });
  }
};

router.patch("/push-notifications", authenticate, togglePushNotifications);
```

---

## Push Notification Service

Create a dedicated service for sending push notifications:

```typescript
// services/pushNotificationService.ts
import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import User from "../models/User";

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
        channelId: "flood-alerts", // Android channel
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

      // Update last notification sent time
      await User.findByIdAndUpdate(userId, {
        lastNotificationSentAt: new Date(),
      });

      // Handle ticket errors (optional - for production)
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

      const messages: ExpoPushMessage[] = users
        .filter((user) => this.isValidToken(user.pushToken!))
        .map((user) => ({
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

      // Update last notification sent time for all users
      await User.updateMany(
        { _id: { $in: userIds } },
        { lastNotificationSentAt: new Date() }
      );

      // Handle ticket errors
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

        // If token is invalid, you might want to remove it from database
        if (ticket.details?.error === "DeviceNotRegistered") {
          // Handle invalid token cleanup (optional)
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

      const userIds = users.map((user) => user._id.toString());
      return this.sendToUsers(userIds, title, body, data);
    } catch (error) {
      console.error("Error sending notifications to location:", error);
      return { success: 0, failed: 0 };
    }
  }
}

export default new PushNotificationService();
```

---

## Background Jobs & Scheduled Tasks

### Option 1: Using node-cron

Install node-cron:

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

Create a cron job service:

```typescript
// services/cronService.ts
import cron from "node-cron";
import pushNotificationService from "./pushNotificationService";
import User from "../models/User";
// Import your flood risk calculation service
// import { calculateFloodRisk } from './floodRiskService';

class CronService {
  start() {
    // Check flood risks every 15 minutes
    cron.schedule("*/15 * * * *", async () => {
      console.log("Running flood risk check...");
      await this.checkFloodRisks();
    });

    // Clean up invalid tokens daily at 2 AM
    cron.schedule("0 2 * * *", async () => {
      console.log("Cleaning up old push tokens...");
      await this.cleanupInvalidTokens();
    });

    console.log("Cron jobs started");
  }

  private async checkFloodRisks() {
    try {
      // Get all users with push tokens enabled
      const users = await User.find({
        pushToken: { $exists: true, $ne: null },
        pushNotificationsEnabled: true,
      });

      for (const user of users) {
        if (!user.city || !user.township) continue;

        // Calculate flood risk for user's location
        // const floodRisk = await calculateFloodRisk(user.city, user.township);
        // Replace with your actual flood risk calculation
        const floodRisk = 0; // Placeholder

        // Only send notification if risk > 70%
        if (floodRisk > 70) {
          // Check if we've already sent a notification recently (e.g., in last hour)
          const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
          if (
            !user.lastNotificationSentAt ||
            user.lastNotificationSentAt < oneHourAgo
          ) {
            await pushNotificationService.sendFloodAlert(
              user._id.toString(),
              floodRisk,
              `${user.city}, ${user.township}`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error in flood risk check:", error);
    }
  }

  private async cleanupInvalidTokens() {
    try {
      // Remove tokens older than 30 days that haven't been updated
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      await User.updateMany(
        {
          pushTokenUpdatedAt: { $lt: thirtyDaysAgo },
        },
        {
          $unset: { pushToken: 1, pushTokenUpdatedAt: 1 },
          pushNotificationsEnabled: false,
        }
      );

      console.log("Invalid tokens cleaned up");
    } catch (error) {
      console.error("Error cleaning up tokens:", error);
    }
  }
}

export default new CronService();
```

Start cron jobs in your main server file:

```typescript
// server.ts or app.ts
import express from "express";
import cronService from "./services/cronService";

const app = express();
// ... your middleware and routes

// Start cron jobs
if (process.env.NODE_ENV !== "test") {
  cronService.start();
}

app.listen(8000, () => {
  console.log("Server running on port 8000");
});
```

### Option 2: Manual Trigger Endpoint

For testing or manual triggers:

```typescript
// routes/admin.ts or similar
import { Request, Response } from "express";
import pushNotificationService from "../services/pushNotificationService";
import User from "../models/User";

export const sendFloodAlertToLocation = async (req: Request, res: Response) => {
  try {
    const { city, township, floodRisk } = req.body;

    if (!city || !township || !floodRisk) {
      return res.status(400).json({
        success: false,
        message: "City, township, and floodRisk are required",
      });
    }

    const users = await User.find({
      city,
      township,
      pushToken: { $exists: true, $ne: null },
      pushNotificationsEnabled: true,
    });

    const results = await Promise.all(
      users.map((user) =>
        pushNotificationService.sendFloodAlert(
          user._id.toString(),
          floodRisk,
          `${city}, ${township}`
        )
      )
    );

    const successCount = results.filter((r) => r === true).length;

    res.json({
      success: true,
      message: `Sent ${successCount} notifications to ${users.length} users`,
      sent: successCount,
      total: users.length,
    });
  } catch (error: any) {
    console.error("Error sending flood alerts:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send flood alerts",
      error: error.message,
    });
  }
};

// Add authentication middleware for admin routes
router.post(
  "/admin/flood-alert",
  authenticate,
  isAdmin,
  sendFloodAlertToLocation
);
```

---

## Error Handling & Token Management

### Token Validation

Expo push tokens can become invalid for several reasons:

- App uninstalled
- Token expired
- Device changed

Handle errors from Expo:

```typescript
// Enhanced error handling in pushNotificationService.ts
import { ExpoPushReceiptId, ExpoPushReceipt } from 'expo-server-sdk';

async checkReceipts(receiptIds: ExpoPushReceiptId[]) {
  const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);

  for (const chunk of receiptIdChunks) {
    try {
      const receipts = await this.expo.getPushNotificationReceiptsAsync(chunk);

      for (const receiptId in receipts) {
        const receipt: ExpoPushReceipt = receipts[receiptId];

        if (receipt.status === 'error') {
          if (receipt.details?.error === 'DeviceNotRegistered') {
            // Remove invalid token from database
            await User.updateMany(
              { pushToken: receiptId },
              {
                $unset: { pushToken: 1, pushTokenUpdatedAt: 1 },
                pushNotificationsEnabled: false,
              }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error checking receipts:', error);
    }
  }
}
```

---

## Testing

### Test Push Token Registration

```bash
# Register a push token
curl -X POST http://localhost:8000/api/v1/user/push-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pushToken": "ExponentPushToken[YOUR_TEST_TOKEN]"
  }'
```

### Test Sending Notification

Create a test endpoint:

```typescript
// routes/test.ts (remove in production)
export const testPushNotification = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;

    const success = await pushNotificationService.sendToUser(
      userId.toString(),
      "Test Notification",
      "This is a test push notification from your backend!",
      { type: "test" }
    );

    res.json({
      success,
      message: success
        ? "Test notification sent"
        : "Failed to send notification",
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

router.post("/test/push", authenticate, testPushNotification);
```

---

## Production Considerations

### 1. Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
import rateLimit from "express-rate-limit";

const pushTokenLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: "Too many push token update requests",
});

router.post("/push-token", authenticate, pushTokenLimiter, registerPushToken);
```

### 2. Logging

Add comprehensive logging:

```typescript
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

// Use in push notification service
logger.info("Push notification sent", { userId, title, body });
```

### 3. Monitoring

Monitor notification success rates:

```typescript
// Add metrics tracking
interface NotificationMetrics {
  totalSent: number;
  successful: number;
  failed: number;
  lastSent: Date;
}

// Store in database or use a monitoring service
```

### 4. Security

- Always validate user authentication
- Sanitize input data
- Use HTTPS in production
- Validate push token format
- Implement request rate limiting

### 5. Error Recovery

- Implement retry logic for failed notifications
- Queue failed notifications for retry
- Monitor and alert on high failure rates

---

## Complete Example: Server Setup

```typescript
// server.ts
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cronService from "./services/cronService";
import userRoutes from "./routes/user";
import adminRoutes from "./routes/admin";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/floodsync")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Routes
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);

// Start cron jobs (only in production/development, not in tests)
if (process.env.NODE_ENV !== "test") {
  cronService.start();
}

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Summary

This implementation provides:

1. ✅ **Device Token Registration** - Users can register their push tokens
2. ✅ **Push Notification Service** - Send notifications to individual or multiple users
3. ✅ **Background Jobs** - Automated flood risk checking and notifications
4. ✅ **Error Handling** - Token validation and cleanup
5. ✅ **Scalability** - Batch sending and efficient database queries
