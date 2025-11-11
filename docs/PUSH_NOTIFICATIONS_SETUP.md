# Push Notifications Setup Guide

## Important: Expo Go Limitations

⚠️ **Push notifications are limited in Expo Go**. For full push notification support, you need to use a **development build**.

## Option 1: Get Your Project ID (For Development Build)

### Step 1: Create an Expo Account (if you don't have one)
```bash
npx expo login
```

### Step 2: Link Your Project
```bash
npx expo init
# Or if already initialized:
npx expo prebuild
```

### Step 3: Get Your Project ID
Your project ID is usually in your `app.json` or you can get it from:
```bash
npx expo whoami
```

Or check your Expo dashboard: https://expo.dev

### Step 4: Add to .env File
Create a `.env` file in your project root:
```env
EXPO_PUBLIC_PROJECT_ID=your-project-id-here
```

## Option 2: Use Development Build (Recommended)

Development builds support full push notification functionality.

### Install EAS CLI
```bash
npm install -g eas-cli
```

### Configure EAS
```bash
eas build:configure
```

### Create Development Build
```bash
# For Android
eas build --profile development --platform android

# For iOS
eas build --profile development --platform ios
```

### Install on Device
After the build completes, install it on your device using the provided link or QR code.

## Option 3: Use Expo Go (Limited - Current Setup)

If you're using Expo Go, push notifications will:
- ✅ Work for local notifications (when app is open/background)
- ❌ **NOT work for remote push notifications** (when app is closed)

The error you're seeing is expected in Expo Go. The code will handle it gracefully and show a warning.

## Current Status

The code has been updated to:
- ✅ Handle missing projectId gracefully
- ✅ Show helpful warning messages
- ✅ Continue working for local notifications
- ✅ Skip push token registration if projectId is missing

## Testing Push Notifications

### In Expo Go (Limited)
- Local notifications will work when app is open/background
- Remote push notifications won't work (app must be closed)

### In Development Build (Full Support)
- All push notifications work, including when app is closed
- Requires projectId to be set

## Quick Fix for Now

If you just want to test local notifications (which work in Expo Go):

1. The app will continue to work
2. Local notifications will still trigger when flood risk > 70%
3. Remote push notifications (from backend) won't work until you use a development build

The error is now handled gracefully - the app won't crash, it will just skip push token registration.

