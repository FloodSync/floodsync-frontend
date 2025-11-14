# Push Notifications in EAS Builds

## ✅ Push Notifications WILL Work in EAS Builds

Push notifications **will work** when you install your app via EAS build on your phone. EAS builds (preview/production) support full push notification functionality.

## What's Been Configured

### 1. Android Configuration ✅

- ✅ `POST_NOTIFICATIONS` permission (required for Android 13+)
- ✅ `RECEIVE_BOOT_COMPLETED` permission
- ✅ `VIBRATE` permission
- ✅ `useNextNotificationsApi: true` (uses latest Android notification API)
- ✅ Notification channel configured in code (`flood-alerts`)

### 2. iOS Configuration ✅

- ✅ `UIBackgroundModes: ["remote-notification"]` in Info.plist
- ✅ Bundle identifier configured

### 3. Project ID ✅

- ✅ Project ID configured in `app.json`: `57742b45-13a4-4d2c-bcbc-f402c43a91fa`
- ✅ Code automatically detects projectId from multiple sources

### 4. Notification Service ✅

- ✅ Automatically registers push token on app start
- ✅ Works with or without authentication
- ✅ Registers with backend API

## How to Verify Push Notifications Work

### Step 1: Build and Install

```bash
npm run eas:build:android:preview
```

### Step 2: Install APK on Your Phone

- Download the APK from the build link
- Install it on your Android device
- Grant notification permissions when prompted

### Step 3: Check Logs

After installing, check the device logs or console output for:

```
✅ Push token obtained successfully: ExponentPushToken[...]
✅ Push token registered with backend (authenticated/unauthenticated): ...
```

### Step 4: Test Notifications

**Option A: Test from Backend**

- Use your backend API to send a test notification
- Endpoint: `POST /api/v1/user/test/push` (if authenticated)
- Or send directly using Expo Push Notification API

**Option B: Trigger Local Notification**

- The app will automatically show notifications when flood risk > 70%
- This tests local notification functionality

**Option C: Send Test Notification via Expo**

```bash
# Install expo-notifications CLI tool
npx expo-notifications send --token YOUR_PUSH_TOKEN --title "Test" --body "This is a test"
```

## Troubleshooting

### Issue: Notifications Not Working After EAS Build

#### 1. Check Permissions

- Go to Android Settings → Apps → FloodSync → Notifications
- Ensure notifications are enabled
- Check that the "Flood Alerts" channel is enabled

#### 2. Check Logs

- Connect your device via USB
- Run: `adb logcat | grep -i notification`
- Look for errors or warnings

#### 3. Verify Push Token Registration

Add this to your app to check if token is registered:

```typescript
import { notificationService } from "@/lib/notifications/notification-service";

// Check registered token
const token = notificationService.getRegisteredToken();
console.log("Registered push token:", token);
```

#### 4. Check Backend Registration

- Verify the push token was sent to your backend
- Check your backend logs/database for the registered token
- Ensure backend can send notifications using Expo Push API

#### 5. Test with Expo Push Notification Tool

```bash
# Get your push token from logs, then:
curl -H "Content-Type: application/json" \
  -X POST https://exp.host/--/api/v2/push/send \
  -d '{
    "to": "ExponentPushToken[YOUR_TOKEN]",
    "title": "Test Notification",
    "body": "This is a test from EAS build",
    "data": { "test": true }
  }'
```

### Common Issues

#### "Push token obtained successfully" but notifications don't arrive

- ✅ Token registration is working
- ❌ Backend might not be sending notifications
- ❌ Check backend logs for notification sending errors
- ❌ Verify backend has `expo-server-sdk` installed

#### "Cannot register for push notifications: permission not granted"

- User denied notification permission
- Go to Settings → Apps → FloodSync → Notifications → Enable

#### "Push notifications are only supported on physical devices"

- You're testing on an emulator
- Push notifications only work on real devices
- Install on a physical phone

#### No push token in logs

- Check that `Device.isDevice` returns true
- Verify projectId is accessible
- Check for errors in the registration process

## Expected Behavior

### When App Starts:

1. ✅ Requests notification permissions (if not granted)
2. ✅ Creates notification channel (Android)
3. ✅ Gets Expo push token
4. ✅ Registers token with backend (authenticated or anonymous)
5. ✅ Logs success message

### When Backend Sends Notification:

1. ✅ Notification arrives even if app is closed
2. ✅ Shows in notification tray
3. ✅ Plays sound and vibrates (if configured)
4. ✅ Opens app when tapped (if configured)

### When Flood Risk > 70%:

1. ✅ Local notification is triggered
2. ✅ Shows alert immediately
3. ✅ Works even if backend is unavailable

## Next Steps

1. **Build the app**: `npm run eas:build:android:preview`
2. **Install on device**: Download and install the APK
3. **Grant permissions**: Allow notifications when prompted
4. **Check logs**: Verify push token registration
5. **Test notifications**: Send a test notification from backend

## Additional Resources

- [Expo Push Notifications Docs](https://docs.expo.dev/push-notifications/overview/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Android Notification Channels](https://developer.android.com/develop/ui/views/notifications/channels)
