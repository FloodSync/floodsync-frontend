# FloodSync Deployment Guide

This guide will help you deploy the FloodSync app to Android and iOS.

## Prerequisites

✅ EAS CLI is installed and you're logged in as `kyawzinthant`
✅ EAS project ID is configured: `57742b45-13a4-4d2c-bcbc-f402c43a91fa`
✅ Android package name: `com.kyawzinthant.floodsync`
✅ iOS bundle identifier: `com.kyawzinthant.floodsync`
✅ `.easignore` file configured to reduce build size (excludes .git, docs, test files)

## Quick Start

### 1. Build for Android (Preview/APK)

This creates an APK file you can install directly on Android devices:

```bash
npx eas-cli build --platform android --profile preview
```

When prompted:

- **Generate a new Android Keystore?** → Type `y` and press Enter
- The build will start and you'll get a download link when complete

### 2. Build for Android (Production/AAB)

For Google Play Store submission:

```bash
npx eas-cli build --platform android --profile production
```

### 3. Build for iOS (Preview)

For testing on iOS devices:

```bash
npx eas-cli build --platform ios --profile preview
```

**Note:** iOS builds require:

- Apple Developer account ($99/year)
- Configure credentials: `npx eas-cli credentials`
- App Store Connect setup

### 4. Build for iOS (Production)

For App Store submission:

```bash
npx eas-cli build --platform ios --profile production
```

## Build Profiles

### Preview

- **Android**: Generates APK for direct installation
- **iOS**: Generates IPA for TestFlight or direct installation
- **Distribution**: Internal (for testing)

### Production

- **Android**: Generates AAB for Google Play Store
- **iOS**: Generates IPA for App Store
- **Distribution**: App stores
- **Auto-increment**: Version numbers increment automatically

### Development

- For development builds with Expo Go or custom dev client
- Includes development tools

## Submitting to App Stores

### Google Play Store

1. Build production AAB:

   ```bash
   npx eas-cli build --platform android --profile production
   ```

2. Submit to Google Play:
   ```bash
   npx eas-cli submit --platform android
   ```

### Apple App Store

1. Build production IPA:

   ```bash
   npx eas-cli build --platform ios --profile production
   ```

2. Submit to App Store:
   ```bash
   npx eas-cli submit --platform ios
   ```

## Managing Credentials

### View credentials:

```bash
npx eas-cli credentials
```

### Android credentials:

- Managed automatically by EAS (recommended)
- Or use local keystore if you have one

### iOS credentials:

- Requires Apple Developer account
- Configure via: `npx eas-cli credentials --platform ios`

## Environment Variables

If you need to set environment variables for builds:

1. Go to [Expo Dashboard](https://expo.dev)
2. Select your project
3. Go to "Secrets" section
4. Add environment variables

Or use EAS CLI:

```bash
npx eas-cli secret:create --scope project --name API_KEY --value your-value
```

## Monitoring Builds

- View build status: [Expo Dashboard](https://expo.dev/accounts/kyawzinthant/projects/floodsync/builds)
- Or use CLI: `npx eas-cli build:list`

## Build Size Optimization

The project includes a `.easignore` file to reduce build archive size by excluding:

- `.git/` directory (~117MB)
- `docs/` directory
- Test files and coverage
- Development files (`.expo/`, `dist/`, etc.)
- IDE configuration files
- Build artifacts

**Note:** Videos in `assets/videos/` (~109MB) are included as they're required by the app.

## Troubleshooting

### Build fails with credential errors

- Run: `npx eas-cli credentials` to set up credentials
- For Android, let EAS manage credentials automatically

### Build fails with "Unknown error" in Prebuild phase

- Check that all referenced files in `app.json` exist (e.g., notification sounds, icons)
- Verify all plugin configurations are correct
- Check build logs at the provided URL for detailed error messages
- Ensure all required assets are present in the project

### iOS build requires certificates

- Ensure you have an Apple Developer account
- Run: `npx eas-cli credentials --platform ios`
- Follow the prompts to set up certificates

### Version conflicts

- Check `app.json` version number
- EAS will auto-increment for production builds

### Build archive is too large

- Check `.easignore` file is properly configured
- Exclude unnecessary files (videos, large assets) if not needed
- Consider using remote URLs for large media files

## Next Steps

1. **First deployment**: Start with Android preview build to test
2. **Test thoroughly**: Install APK on devices and test all features
3. **Production build**: Once tested, create production builds
4. **App Store submission**: Submit to stores when ready

## Useful Commands

```bash
# Check build status
npx eas-cli build:list

# View build details
npx eas-cli build:view [BUILD_ID]

# Download build
npx eas-cli build:download [BUILD_ID]

# Update EAS CLI
npm install -g eas-cli@latest
```
