# Mobile App Deployment Guide

This guide explains how to build, deploy, and distribute the Deazl mobile app without using the Play Store or App Store.

## Architecture Overview

Deazl is a **hybrid web app** using Capacitor. The mobile app is essentially a native wrapper that loads your Next.js application from a remote server. This means:

- ✅ App updates are instant (just deploy to your server)
- ✅ No need to rebuild APK for content/code changes
- ✅ Full Next.js features (Server Actions, API routes, Prisma)
- ⚠️ Requires internet connection

## Table of Contents

- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Building for Android](#building-for-android)
- [Installing on Android](#installing-on-android)
- [Connecting to Staging/Production](#connecting-to-stagingproduction)
- [Distribution Options](#distribution-options)
- [Update Strategy](#update-strategy)
- [iOS Deployment](#ios-deployment)

---

## Prerequisites

### For Android

- **Android Studio** installed
- **Java JDK 17+**
- **Android SDK** (installed via Android Studio)
- USB debugging enabled on your device

### For iOS

- **Xcode 15+** (macOS only)
- **CocoaPods**: `sudo gem install cocoapods`
- Apple Developer account (for device testing)

---

## Development Setup

### 1. Get Your Local IP

```bash
# From apps/pcomparator
make mobile-ip
# Or
yarn mobile:ip
```

### 2. Start Development with QR Code

```bash
# Start dev server with mobile instructions
make mobile-dev
# Or
yarn mobile:dev
```

This will:
- Start the Next.js dev server
- Display your local IP
- Show a QR code for browser testing
- Set `CAPACITOR_DEV_SERVER_URL` automatically

### 3. Run on Device

In another terminal:

```bash
# Android
make android-run

# iOS  
make ios-run
```

The app will connect to your local dev server.

---

## Building for Android

### Configure Server URL

Before building, update `capacitor.config.ts` to point to your staging/production URL:

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: "com.deazl.app",
  appName: "Deazl",
  webDir: "out",
  server: {
    url: "https://staging.deazl.com", // Your staging URL
    cleartext: false
  },
  // ... rest of config
};
```

### Sync Changes

```bash
make cap-sync
# Or
yarn cap:sync
```

### Build Debug APK

```bash
make android-apk
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

### Build Release APK

1. **Create a signing key** (only once):

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore deazl-release-key.keystore -alias deazl -keyalg RSA -keysize 2048 -validity 10000
```

2. **Configure signing** in `android/app/build.gradle`:

```gradle
android {
    signingConfigs {
        release {
            storeFile file('deazl-release-key.keystore')
            storePassword System.getenv("KEYSTORE_PASSWORD") ?: 'your_password'
            keyAlias 'deazl'
            keyPassword System.getenv("KEY_PASSWORD") ?: 'your_password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **Build**:

```bash
make android-release
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

---

## Installing on Android

### Option 1: USB Installation (ADB)

```bash
# List connected devices
adb devices

# Install APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or for release
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Option 2: Direct Download

1. Host the APK on your server
2. Enable "Install from Unknown Sources" on Android
3. Download and install from browser

### Option 3: QR Code

Generate a QR code pointing to your APK URL for easy distribution.

---

## Connecting to Staging/Production

### Development → Staging Workflow

1. **Development**: App connects to `http://YOUR_LOCAL_IP:3001`
2. **Staging Build**: App connects to `https://staging.deazl.com`
3. **Production Build**: App connects to `https://deazl.com`

### Environment-based Configuration

```typescript
// capacitor.config.ts
const getServerUrl = () => {
  if (process.env.CAPACITOR_DEV_SERVER_URL) {
    return process.env.CAPACITOR_DEV_SERVER_URL;
  }
  
  // For production builds, use your staging/prod URL
  return "https://staging.deazl.com";
};

const config: CapacitorConfig = {
  server: {
    url: getServerUrl(),
    cleartext: getServerUrl().startsWith("http://")
  }
};
```

### Building for Different Environments

```bash
# For staging
# 1. Update capacitor.config.ts with staging URL
# 2. Sync and build
make cap-sync
make android-apk

# For production  
# 1. Update capacitor.config.ts with production URL
# 2. Sync and build
make cap-sync
make android-release
```

---

## Distribution Options

### 1. Self-Hosted (Recommended for Beta)

Host APK on your server:

```
https://staging.deazl.com/downloads/deazl-latest.apk
```

**Pros**: Free, full control, instant updates
**Cons**: Users must enable "Unknown Sources"

### 2. Firebase App Distribution

Free tier with beta testing features:

```bash
npm install -g firebase-tools
firebase appdistribution:distribute android/app/build/outputs/apk/release/app-release.apk \
  --app YOUR_FIREBASE_APP_ID \
  --groups "testers"
```

### 3. GitHub Releases

```bash
gh release create v1.0.0 android/app/build/outputs/apk/release/app-release.apk \
  --title "Deazl v1.0.0" \
  --notes "Release notes here"
```

### 4. Alternative Stores (Free)

- **Amazon Appstore**
- **Samsung Galaxy Store** 
- **Huawei AppGallery**
- **F-Droid** (for open source)

---

## Update Strategy

### Web Updates (No APK Needed) ✨

Since your app loads from a remote server, **most updates don't require a new APK**:

1. Deploy new code to `staging.deazl.com`
2. Users automatically get the new version
3. No app store review, no APK download

### When You Need a New APK

Only rebuild APK when:
- Adding new native plugins
- Changing app permissions
- Updating Capacitor version
- Changing app icon/splash screen
- Modifying `capacitor.config.ts`

### Version Check (Optional)

Implement in-app version checking for native updates:

```typescript
// Check if APK update is available
const checkNativeUpdate = async () => {
  const response = await fetch('https://staging.deazl.com/api/app-version');
  const { minNativeVersion, latestApkUrl } = await response.json();
  
  const currentVersion = await App.getInfo(); // @capacitor/app
  
  if (currentVersion.version < minNativeVersion) {
    // Prompt user to download new APK
    await Browser.open({ url: latestApkUrl });
  }
};
```

---

## iOS Deployment

### TestFlight (Recommended for Beta)

1. Configure signing in Xcode
2. Archive: `Product > Archive`
3. Upload to App Store Connect
4. Invite up to 10,000 testers via email

### Ad Hoc Distribution

For up to 100 registered devices:

1. Register device UDIDs in Apple Developer Portal
2. Create provisioning profile
3. Build and distribute IPA

### iOS Setup Commands

```bash
# Install CocoaPods dependencies
make ios-pods

# Open Xcode
make ios

# Run on device/simulator
make ios-run
```

---

## Quick Commands Reference

```bash
# Development
make mobile-dev          # Start dev with QR code
make mobile-ip           # Show local IP

# Sync platforms
make cap-sync            # Sync all platforms

# Android
make android             # Open Android Studio
make android-run         # Run on device
make android-sync        # Sync Android only
make android-apk         # Build debug APK
make android-release     # Build release APK

# iOS
make ios                 # Open Xcode
make ios-run             # Run on device/simulator
make ios-sync            # Sync iOS only
make ios-pods            # Install CocoaPods
```

---

## Troubleshooting

### "App not installed" Error

1. Enable "Install from Unknown Sources"
2. Uninstall existing version first
3. Check APK signature

### Connection Refused

1. Ensure phone and computer on same WiFi
2. Check firewall settings
3. Verify IP address is correct

### ADB Device Not Found

```bash
adb kill-server && adb start-server
adb devices
```

### iOS Pod Install Fails

```bash
cd ios/App
pod deintegrate
rm Podfile.lock
pod install
```

---

## Summary

**For staging/testing without Play Store:**

1. **Configure** `capacitor.config.ts` with staging URL
2. **Sync**: `make cap-sync`
3. **Build**: `make android-apk` or `make android-release`
4. **Distribute**: Host on server, use Firebase, or GitHub Releases
5. **Update**: Just deploy to staging - app auto-updates!

This approach gives you:
- 🆓 Completely free distribution
- ⚡ Instant updates via web deployment
- 🎮 Full control over your app
