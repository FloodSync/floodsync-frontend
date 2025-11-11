# Unauthenticated Push Notifications

## Overview

Push notifications now work **without requiring user login**. The app will automatically register push tokens when the app starts, whether the user is logged in or not.

## Frontend Implementation ✅

The frontend has been updated to:

- ✅ Register push tokens automatically on app start (logged in or not)
- ✅ Use authenticated endpoint if user is logged in
- ✅ Use unauthenticated endpoint if user is not logged in
- ✅ Re-register token when user logs in/out to link/unlink from account

## Backend Endpoint Required

You need to implement this **new endpoint** in your backend:

### POST /api/v1/device/push-token

**Description:** Register push token for anonymous/unauthenticated devices.

**Authentication:** ❌ **NOT REQUIRED** (no auth token needed)

**Request Body:**

```json
{
  "pushToken": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "message": "Push token registered successfully"
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "message": "Push token is required"
}
```

or

```json
{
  "success": false,
  "message": "Invalid push token format"
}
```

## Backend Implementation

### Option 1: Store in Separate DeviceTokens Collection

```typescript
// models/DeviceToken.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IDeviceToken extends Document {
  pushToken: string;
  userId?: string; // Optional - link to user if they log in later
  deviceId?: string; // Optional - device identifier
  createdAt: Date;
  updatedAt: Date;
}

const DeviceTokenSchema = new Schema<IDeviceToken>(
  {
    pushToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deviceId: String,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IDeviceToken>("DeviceToken", DeviceTokenSchema);
```

### Option 2: Store in User Model (with optional userId)

```typescript
// In your User model, you can also store anonymous tokens
// Or create a separate collection for anonymous devices
```

### Route Implementation

```typescript
// routes/device.ts
import { Request, Response } from "express";
import DeviceToken from "../models/DeviceToken"; // Or your preferred model

export const registerDevicePushToken = async (req: Request, res: Response) => {
  try {
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

    // Store or update device token (upsert - create if doesn't exist, update if exists)
    await DeviceToken.findOneAndUpdate(
      { pushToken },
      {
        pushToken,
        // userId remains null for anonymous devices
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
      }
    );

    res.json({
      success: true,
      message: "Push token registered successfully",
    });
  } catch (error: any) {
    console.error("Error registering device push token:", error);
    res.status(500).json({
      success: false,
      message: "Failed to register push token",
      error: error.message,
    });
  }
};

// Add to your router (NO AUTHENTICATION MIDDLEWARE)
router.post("/device/push-token", registerDevicePushToken);
```

### Linking Anonymous Tokens to Users (Optional)

When a user logs in, you can link their anonymous device token to their user account:

```typescript
// In your login/register route, after successful authentication
export const linkDeviceTokenToUser = async (
  userId: string,
  pushToken: string
) => {
  // Update device token to link to user
  await DeviceToken.findOneAndUpdate(
    { pushToken },
    { userId, updatedAt: new Date() },
    { upsert: true }
  );

  // Also update user's push token (if you store it there too)
  await User.findByIdAndUpdate(userId, {
    pushToken,
    pushTokenUpdatedAt: new Date(),
  });
};
```

## Sending Notifications

### To All Devices (Including Anonymous)

```typescript
// Get all push tokens (authenticated and anonymous)
const allTokens = await DeviceToken.find({
  pushToken: { $exists: true, $ne: null },
});

const pushTokens = allTokens.map((device) => device.pushToken);

// Send to all devices
await pushNotificationService.sendToMultipleTokens(pushTokens, title, body);
```

### To Specific Users Only

```typescript
// Get tokens for logged-in users
const userTokens = await DeviceToken.find({
  userId: { $exists: true, $ne: null },
}).populate("userId");

// Or use User model if you store tokens there
const users = await User.find({
  pushToken: { $exists: true, $ne: null },
  pushNotificationsEnabled: true,
});
```

## Flow Diagram

```
App Starts
    │
    ├─ User Logged In?
    │   │
    │   ├─ Yes → POST /api/v1/user/push-token (with auth)
    │   │         (Token linked to user account)
    │   │
    │   └─ No → POST /api/v1/device/push-token (no auth)
    │            (Token stored as anonymous device)
    │
    └─ User Logs In Later
        │
        └─ Re-register token → POST /api/v1/user/push-token
          (Links anonymous token to user account)
```

## Summary

- ✅ Frontend automatically registers push tokens (logged in or not)
- ⏳ Backend needs: `POST /api/v1/device/push-token` (no auth required)
- 💡 Store tokens in DeviceToken collection or User model
- 🔗 Optionally link anonymous tokens to users when they log in
- 📱 Send notifications to all devices or filter by user status
