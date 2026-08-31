# CI/CD Setup and Configuration

This document describes the complete setup of the CI/CD pipeline for Pimcore Voyager with GitHub Actions and Expo Application Services (EAS).

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [EAS Configuration](#eas-configuration)
4. [Setting Up GitHub Secrets](#setting-up-github-secrets)
5. [Build Profiles](#build-profiles)
6. [Workflows](#workflows)
7. [Android Signing](#android-signing)
8. [iOS Signing](#ios-signing)
9. [Troubleshooting](#troubleshooting)

## Overview

The CI/CD pipeline automates the build and deployment process for Android and iOS with the following features:

- ✅ Automatic builds on push/merge to main branches
- ✅ Manual builds via the GitHub Actions UI
- ✅ EAS Build integration for Android (APK/AAB) and iOS (IPA)
- ✅ Artifact upload to GitHub Actions
- ✅ Optional: TestFlight deployment
- ✅ Optional: Release automation

## Prerequisites

### 1. Create an Expo Account

1. Sign up at [expo.dev](https://expo.dev)
2. Create a new project or link an existing one
3. Generate an access token:
   - Go to [expo.dev/accounts/[username]/settings/access-tokens](https://expo.dev/accounts)
   - Create a new token named "GitHub Actions"
   - Store the token securely (it will be needed as a GitHub Secret)

### 2. Install the EAS CLI (locally)

```bash
npm install -g eas-cli
eas login
```

### 3. Initialize the Project with EAS

```bash
cd /path/to/PimcoreVoyager
eas init
```

This updates `app.json` with the project ID.

## EAS Configuration

The `eas.json` file defines the various build profiles:

### Build Profiles

#### `development`
- Development builds with debug configuration
- Android: APK
- iOS: debug build

#### `preview`
- Test builds for internal distribution
- Android: APK
- iOS: release build without the App Store

#### `production`
- Production builds for store distribution
- Android: APK (or AAB with the `production-aab` profile)
- iOS: release build for the App Store/TestFlight

### Example `eas.json`

```json
{
  "cli": {
    "version": ">= 5.9.0"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      },
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## Setting Up GitHub Secrets

Navigate to: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### Required Secrets

#### 1. `EXPO_TOKEN` (required)

The Expo access token for EAS Build.

```
Value: [your-expo-access-token]
```

#### 2. Android Signing (optional for signed builds)

If you want to sign your Android builds, upload the keystore to EAS:

```bash
eas credentials
```

Follow the instructions to upload your keystore.

Alternatively, you can let EAS manage the signing automatically.

#### 3. iOS Signing (optional for iOS builds)

For iOS builds you need:

- Apple Developer account
- Distribution certificate (.p12)
- Provisioning profile (.mobileprovision)

**Option A: EAS Credentials Manager (recommended)**

```bash
eas credentials
```

EAS can generate and manage certificates automatically.

**Option B: Manual upload**

```bash
eas credentials --platform ios
```

Follow the instructions to upload your certificates.

#### 4. TestFlight Secrets (optional)

For automatic TestFlight deployment:

- `EXPO_APPLE_ID`: Your Apple ID
- `EXPO_APPLE_APP_SPECIFIC_PASSWORD`: App-specific password

To generate an app-specific password:
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in → Security → App-Specific Passwords
3. Generate a password and store it as a secret

### Optional Variables

#### `ENABLE_TESTFLIGHT_DEPLOY`

To enable TestFlight deployment, create a repository variable:

`Settings` → `Secrets and variables` → `Actions` → `Variables` → `New repository variable`

```
Name: ENABLE_TESTFLIGHT_DEPLOY
Value: true
```

## Workflows

### 1. `build.yml` - Standard Build Workflow

Triggers automatically on:
- Push to the `main` or `develop` branch
- Pull requests targeting `main` or `develop`
- Manual trigger via the Actions UI

**Manual execution:**

1. Go to `Actions` → `Build and Deploy`
2. Click `Run workflow`
3. Select the platform (`android`, `ios`, or `all`)
4. Select the build profile (`development`, `preview`, or `production`)
5. Click `Run workflow`

**Features:**
- Parallel builds for Android and iOS
- EAS Build integration
- Build status comments on PRs

### 2. `build-artifacts.yml` - Build with Artifact Download

Triggers on:
- Manual trigger via the Actions UI
- GitHub Release created

**Features:**
- Waits for build completion
- Downloads the finished APK/IPA files
- Uploads artifacts to GitHub Actions (30-day retention)
- Attaches artifacts to GitHub Releases

**Note:** This workflow takes longer (up to 60 minutes) because it waits for the EAS build.

## Android Signing

### Option 1: EAS Managed Credentials (recommended)

EAS automatically generates and manages a keystore:

```bash
eas credentials
```

Select "Set up new Android Keystore" and follow the instructions.

### Option 2: Your Own Keystore

#### Generate a keystore

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore pimcore-voyager.keystore \
  -alias pimcore-voyager \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

#### Upload the keystore to EAS

```bash
eas credentials
```

Select "Set up new Android Keystore" → "Upload existing keystore".

**Important:** Store the keystore passwords securely! Losing them means you can no longer publish app updates.

## iOS Signing

### Prerequisites

- Apple Developer account ($99/year)
- Xcode on macOS (for local development)

### Option 1: EAS Managed Credentials (recommended)

```bash
eas credentials --platform ios
```

EAS can automatically:
- Generate a distribution certificate
- Create provisioning profiles
- Manage push notification keys

### Option 2: Manual Certificates

#### 1. Create a distribution certificate

1. Open [developer.apple.com/account/resources/certificates](https://developer.apple.com/account/resources/certificates)
2. Create an "iOS Distribution Certificate"
3. Download it as `.cer`, convert it to `.p12`:

```bash
# On macOS with Keychain Access
# Export as .p12 with a password
```

#### 2. Create a provisioning profile

1. Open [developer.apple.com/account/resources/profiles](https://developer.apple.com/account/resources/profiles)
2. Create an "App Store" or "Ad Hoc" profile
3. Download it as `.mobileprovision`

#### 3. Upload to EAS

```bash
eas credentials --platform ios
```

Follow the instructions to upload.

### Configure App Store Connect

For TestFlight/App Store deployment:

1. Create the app in [App Store Connect](https://appstoreconnect.apple.com)
2. The bundle identifier must match `app.json`: `com.pimcore.voyager`
3. Fill in all required app information

## Troubleshooting

### Build fails: "Invalid credentials"

**Solution:**
1. Check the `EXPO_TOKEN` secret
2. Generate a new token at [expo.dev](https://expo.dev)
3. Update the GitHub Secret

### Android build error: "Keystore not found"

**Solution:**
```bash
eas credentials --platform android
```

Set up a keystore or let EAS generate one.

### iOS build error: "Provisioning profile expired"

**Solution:**
1. Generate a new provisioning profile at [developer.apple.com](https://developer.apple.com)
2. Upload it with `eas credentials --platform ios`

### Build takes a very long time

EAS builds can take 10-30 minutes. This is normal.

**To speed things up:**
- Use the `--non-interactive` flag
- Use the `preview` profile for faster test builds

### TestFlight upload fails

**Common causes:**
- App-specific password is wrong
- App has not been created in App Store Connect
- Bundle identifier does not match

**Solution:**
1. Check the `EXPO_APPLE_ID` and `EXPO_APPLE_APP_SPECIFIC_PASSWORD` secrets
2. Make sure the app exists in App Store Connect
3. Check the bundle identifier in `app.json`

### Workflow cannot find the artifact

The `build-artifacts.yml` workflow waits for build completion. On timeout (60 min):

**Solution:**
- Increase the `TIMEOUT` variable in the workflow
- Use the simple `build.yml` workflow and download artifacts manually from the EAS Dashboard

## Further Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [iOS Code Signing](https://developer.apple.com/support/code-signing/)

## Support

For questions or problems:
1. Check the [Expo Forums](https://forums.expo.dev/)
2. Create an issue in this repository
3. Contact the Pimcore Voyager team
