# Push Notifications - High Level Overview

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Current Implementation (Local Notifications)](#current-implementation-local-notifications)
3. [Backend Integration (Push Notifications)](#backend-integration-push-notifications)
4. [Key Concepts](#key-concepts)
5. [Flow Diagrams](#flow-diagrams)

---

## Architecture Overview

The notification system has two modes:

### 1. **Local Notifications** (Currently Implemented)

- Triggered by the app itself when flood risk > 70%
- Works when app is in foreground or background
- **Does NOT work when app is completely closed/killed**

### 2. **Push Notifications** (To Be Implemented)

- Sent from your Express backend server
- Works even when app is completely closed
- Requires device token registration

---

## Current Implementation (Local Notifications)

### Components

```
┌─────────────────────────────────────────────────────────┐
│                    Home Screen                          │
│  (app/tabs/(tabs)/home.tsx)                            │
│  - Monitors flood risk                                 │
│  - Calls useFloodNotifications hook                    │
└──────────────────┬────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         useFloodNotifications Hook                       │
│  (hooks/use-flood-notifications.ts)                     │
│  - Watches flood risk changes                          │
│  - Triggers notification when risk > 70%               │
│  - Handles notification listeners                      │
└──────────────────┬────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│         NotificationService                             │
│  (lib/notifications/notification-service.ts)             │
│  - Requests permissions                                 │
│  - Schedules notifications                              │
│  - Configures Android channels                          │
└─────────────────────────────────────────────────────────┘
```

### Key Files

1. **`lib/notifications/notification-service.ts`**

   - Core service for notification operations
   - Handles permissions, scheduling, Android channels
   - Prevents duplicate notifications

2. **`hooks/use-flood-notifications.ts`**

   - React hook that monitors flood risk
   - Sets up notification listeners
   - Triggers notifications when threshold crossed

3. **`app/tabs/(tabs)/home.tsx`**
   - Uses the hook to monitor flood risk
   - Passes flood risk and location to hook

### How It Works

1. **Monitoring**: Home screen continuously monitors flood risk from API
2. **Threshold Check**: When risk > 70%, hook detects the change
3. **Permission Check**: Service ensures notification permissions are granted
4. **Notification Sent**: Local notification is scheduled immediately
5. **Duplicate Prevention**: Won't send again for same risk level

---

## Backend Integration (Push Notifications)

### Overview

To send notifications from your Express backend, you need:

1. **Device Token Registration**: App registers with backend to receive push notifications
2. **Backend Service**: Express server sends notifications via Expo Push Notification Service
3. **Token Storage**: Backend stores user tokens linked to their location/risk preferences

### Architecture Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│   Mobile App │         │ Express API  │         │ Expo Push    │
│              │         │              │         │ Service      │
└──────┬───────┘         └──────┬───────┘         └──────┬───────┘
       │                        │                        │
       │ 1. Register Token     │                        │
       │───────────────────────>│                        │
       │                        │                        │
       │ 2. Store Token         │                        │
       │    (in database)       │                        │
       │                        │                        │
       │                        │ 3. Flood Risk > 70%   │
       │                        │    Send Notification   │
       │                        │───────────────────────>│
       │                        │                        │
       │                        │                        │ 4. Push to Device
       │                        │                        │───────────────────>
       │                        │                        │
       │ 5. Receive Notification│                        │
       │<─────────────────────────────────────────────────│
```

### Implementation Steps

#### Step 1: Get Device Token (Mobile App)

Add to your app initialization:

```typescript
// In app/_layout.tsx or app/index.tsx
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

async function registerForPushNotifications() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("flood-alerts", {
      name: "Flood Alerts",
      importance: Notifications.AndroidImportance.HIGH,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    return null;
  }

  token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
}
```

#### Step 2: Send Token to Backend

```typescript
// After getting token, send to your API
const token = await registerForPushNotifications();

if (token && isAuthenticated) {
  await fetch(`${API_URL}/user/push-token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${userToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pushToken: token }),
  });
}
```

#### Step 3: Backend API Endpoint

```javascript
// Express route to store push token
app.post("/api/v1/user/push-token", authenticate, async (req, res) => {
  const { pushToken } = req.body;
  const userId = req.user._id;

  // Store in database
  await User.findByIdAndUpdate(userId, {
    pushToken,
    pushTokenUpdatedAt: new Date(),
  });

  res.json({ success: true });
});
```

#### Step 4: Send Notification from Backend

```javascript
// When flood risk > 70%, send notification
const { Expo } = require("expo-server-sdk");

async function sendFloodAlert(userId, floodRisk, location) {
  const user = await User.findById(userId);

  if (!user.pushToken) return;

  const expo = new Expo();
  const messages = [
    {
      to: user.pushToken,
      sound: "default",
      title: "High Flood Risk Alert",
      body: `Flood risk is ${floodRisk}% in ${location}. Please stay alert.`,
      data: {
        type: "flood_alert",
        floodRisk,
        location,
      },
      priority: "high",
      channelId: "flood-alerts", // Android channel
    },
  ];

  const chunks = expo.chunkPushNotifications(messages);
  const tickets = [];

  for (const chunk of chunks) {
    try {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      tickets.push(...ticketChunk);
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }
}
```

### Required Backend Dependencies

```bash
npm install expo-server-sdk
```

### Key Backend Endpoints Needed

1. **POST `/api/v1/user/push-token`**

   - Store/update user's push token
   - Requires authentication

2. **POST `/api/v1/notifications/send`** (Optional - for admin)

   - Send notifications to specific users
   - For manual alerts

3. **Background Job** (Recommended)
   - Periodically check flood risks
   - Automatically send notifications when risk > 70%
   - Can use cron jobs or scheduled tasks

---

## Key Concepts

### 1. **Local vs Push Notifications**

| Feature               | Local Notifications | Push Notifications      |
| --------------------- | ------------------- | ----------------------- |
| Trigger               | App itself          | Backend server          |
| Works when app closed | ❌ No               | ✅ Yes                  |
| Requires internet     | ❌ No               | ✅ Yes                  |
| Requires device token | ❌ No               | ✅ Yes                  |
| Use case              | Immediate alerts    | Server-triggered alerts |

### 2. **Notification Channels (Android)**

Android requires notification channels for organization:

- **Channel ID**: `flood-alerts`
- **Importance**: `HIGH` (ensures vibration, sound, heads-up)
- **Vibration Pattern**: `[0, 250, 250, 250]`

### 3. **Expo Push Token**

- Unique identifier for each device
- Format: `ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]`
- Must be sent to backend and stored
- Token can change (app reinstall, etc.)

### 4. **Notification Data Payload**

```typescript
{
  title: string,           // Notification title
  body: string,            // Notification message
  sound: boolean,          // Play sound
  priority: 'high',       // Android priority
  data: {                  // Custom data
    type: 'flood_alert',
    floodRisk: number,
    location: string,
  }
}
```

---

## Flow Diagrams

### Current Flow (Local Notifications)

```
User Opens App
    │
    ▼
App Monitors Flood Risk (every few seconds/minutes)
    │
    ▼
Flood Risk > 70%?
    │
    ├─ No ──> Continue Monitoring
    │
    └─ Yes ──> Check if already notified for this risk
              │
              ├─ Already Notified ──> Skip
              │
              └─ Not Notified ──> Request Permissions
                                  │
                                  ├─ Denied ──> Log Warning
                                  │
                                  └─ Granted ──> Send Notification
                                                  │
                                                  └─> User Receives Alert
```

### Future Flow (Push Notifications)

```
App Starts
    │
    ▼
Register for Push Notifications
    │
    ▼
Get Expo Push Token
    │
    ▼
Send Token to Backend API
    │
    ▼
Backend Stores Token in Database
    │
    ▼
[Background Process]
    │
    ▼
Backend Checks Flood Risk (periodic job)
    │
    ▼
Risk > 70% for User's Location?
    │
    ├─ No ──> Continue Monitoring
    │
    └─ Yes ──> Send Push Notification via Expo
              │
              └─> Expo Push Service
                  │
                  └─> Device Receives Notification
                      │
                      └─> App Shows Notification (even if closed)
```

---

## Important Notes

### For Local Notifications (Current)

- ✅ Works immediately when app is open/background
- ❌ Does NOT work when app is killed
- ✅ No backend required
- ✅ Good for immediate alerts during active use

### For Push Notifications (Future)

- ✅ Works even when app is completely closed
- ✅ Can be triggered by backend events
- ✅ Requires backend setup
- ✅ Better for critical alerts

### Best Practice: Hybrid Approach

- Use **local notifications** for immediate alerts when app is active
- Use **push notifications** for critical alerts when app is closed
- Backend can send push notifications for:
  - High flood risk detected
  - Community alerts
  - Emergency evacuations
  - Scheduled safety checks

---

## Quick Reference

### Enable Demo Mode for Testing

```env
# .env file
EXPO_PUBLIC_DEMO_MODE=true
```

### Test Notification Locally

1. Set demo mode flood risk > 70 in `lib/config/app-config.ts`
2. Open app
3. Notification should trigger immediately

### Backend Integration Checklist

- [ ] Install `expo-server-sdk` in backend
- [ ] Create endpoint to store push tokens
- [ ] Set up background job to check flood risks
- [ ] Implement notification sending logic
- [ ] Test with Expo Push Notification Tool (https://expo.dev/notifications)

---

## Resources

- [Expo Notifications Docs](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Expo Push Notification Service](https://docs.expo.dev/push-notifications/overview/)
- [Expo Server SDK](https://github.com/expo/expo-server-sdk-node)
