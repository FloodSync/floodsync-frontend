# Push Notifications Quick Start Guide

## Overview

This guide will help you set up push notifications that work even when the app is closed. The implementation includes both frontend (React Native/Expo) and backend (Express + TypeScript + MongoDB) components.

## What's Been Implemented

### Frontend (✅ Complete)

1. **API Client** (`lib/api/notifications.ts`)
   - `registerPushToken()` - Register device token with backend
   - `removePushToken()` - Remove token on logout
   - `togglePushNotifications()` - Enable/disable notifications

2. **Notification Service** (`lib/notifications/notification-service.ts`)
   - `registerForPushNotifications()` - Get Expo push token and register with backend
   - `unregisterPushToken()` - Remove token from backend
   - Automatic registration on app start when user is authenticated

3. **App Integration** (`app/_layout.tsx`)
   - Automatically registers push token when user logs in
   - Automatically unregisters push token when user logs out

## Backend Setup Required

### Step 1: Install Dependencies

```bash
cd your-backend-directory
npm install expo-server-sdk
npm install node-cron
npm install --save-dev @types/node-cron
```

### Step 2: Update User Model

Add these fields to your User schema:

```typescript
pushToken?: string;
pushTokenUpdatedAt?: Date;
pushNotificationsEnabled?: boolean;
lastNotificationSentAt?: Date;
```

### Step 3: Create API Endpoints

You need to implement these endpoints (see `docs/BACKEND_PUSH_NOTIFICATIONS.md` for full implementation):

1. **POST `/api/v1/user/push-token`** - Register/update push token
2. **DELETE `/api/v1/user/push-token`** - Remove push token
3. **PATCH `/api/v1/user/push-notifications`** - Toggle notifications on/off

### Step 4: Create Push Notification Service

Create a service to send push notifications (see full implementation in `docs/BACKEND_PUSH_NOTIFICATIONS.md`):

```typescript
// services/pushNotificationService.ts
import { Expo } from 'expo-server-sdk';

// Send notification to user
await pushNotificationService.sendToUser(userId, title, body, data);

// Send flood alert
await pushNotificationService.sendFloodAlert(userId, floodRisk, location);
```

### Step 5: Set Up Background Jobs (Optional)

Set up cron jobs to automatically check flood risks and send notifications:

```typescript
// Check flood risks every 15 minutes
cron.schedule('*/15 * * * *', async () => {
  await checkFloodRisksAndNotify();
});
```

## Testing

### Test Frontend Registration

1. Run your app on a physical device (push notifications don't work on simulators)
2. Log in to your app
3. Check the console logs - you should see: "Push token registered with backend: ExponentPushToken[...]"

### Test Backend Endpoint

```bash
# Register a push token
curl -X POST http://localhost:8000/api/v1/user/push-token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "pushToken": "ExponentPushToken[YOUR_TOKEN]"
  }'
```

### Test Sending Notification

Create a test endpoint in your backend:

```typescript
router.post('/test/push', authenticate, async (req, res) => {
  const userId = req.user._id;
  const success = await pushNotificationService.sendToUser(
    userId.toString(),
    'Test Notification',
    'This is a test!',
    { type: 'test' }
  );
  res.json({ success });
});
```

## How It Works

1. **User logs in** → App automatically requests push notification permissions
2. **Permissions granted** → App gets Expo push token
3. **Token sent to backend** → Backend stores token in database
4. **Backend detects flood risk** → Sends push notification via Expo Push Service
5. **Device receives notification** → Works even when app is closed!

## Important Notes

- ⚠️ Push notifications only work on **physical devices**, not simulators
- ⚠️ User must grant notification permissions
- ⚠️ Backend must be running and accessible
- ⚠️ Expo push tokens can change (app reinstall, etc.) - handle token updates

## Next Steps

1. ✅ Frontend is ready - tokens will be registered automatically
2. ⏳ Implement backend endpoints (see `docs/BACKEND_PUSH_NOTIFICATIONS.md`)
3. ⏳ Set up background jobs for automated flood alerts
4. ⏳ Test on a physical device

## Full Documentation

For complete backend implementation details, see:
- **`docs/BACKEND_PUSH_NOTIFICATIONS.md`** - Complete backend guide with code examples

## Troubleshooting

### Token not registering
- Check backend is running and accessible
- Check authentication token is valid
- Check console logs for errors
- Verify user is logged in

### Notifications not received
- Verify push token is stored in database
- Check backend logs for sending errors
- Ensure device has internet connection
- Test with a manual notification first

### Backend errors
- Verify `expo-server-sdk` is installed
- Check MongoDB connection
- Verify user model has push token fields
- Check authentication middleware is working

