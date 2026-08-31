# Documentation: CI/CD Build Pipeline

This documentation describes the complete CI/CD pipeline for Pimcore Voyager.

## 📚 Documentation Overview

### For Beginners

1. **[SECRETS-SETUP.md](./SECRETS-SETUP.md)** - ⭐ **START HERE**
   - Quick-start guide for GitHub Secrets
   - Step-by-step configuration
   - Minimal setup in 10 minutes

### Complete Documentation

2. **[CI-CD-SETUP.md](./CI-CD-SETUP.md)** - 📖 **Main documentation**
   - Complete pipeline setup
   - EAS configuration
   - Workflow explanations
   - Troubleshooting guide

3. **[BUILD-PROCESS.md](./BUILD-PROCESS.md)** - 🔧 **Build details**
   - Build architecture
   - Build profiles (development, preview, production)
   - EAS commands
   - Performance optimization

4. **[SIGNING.md](./SIGNING.md)** - 🔐 **Signing & certificates**
   - Android keystore setup
   - iOS certificate/provisioning
   - Credential management
   - Store configuration

## 🚀 Quickstart

### 1. Set Up GitHub Secrets (5 min)

```bash
# 1. Create an Expo account at expo.dev
# 2. Generate an access token
# 3. Add it as a GitHub Secret: EXPO_TOKEN
```

→ Detailed guide: [SECRETS-SETUP.md](./SECRETS-SETUP.md)

### 2. Initialize the App with EAS (5 min)

```bash
npm install -g eas-cli
eas login
eas init
```

### 3. Start the First Build

**Via GitHub Actions:**
1. Go to the `Actions` tab
2. Select "Build and Deploy"
3. Click "Run workflow"
4. Platform: `android`, Profile: `preview`
5. Start the workflow

**Via CLI:**
```bash
eas build --platform android --profile preview
```

## 📋 Checklist: Complete Setup

### Basic Setup (required)

- [ ] Expo account created
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Project initialized with EAS (`eas init`)
- [ ] `EXPO_TOKEN` added as a GitHub Secret
- [ ] First test build successful

### Android Signing

- [ ] Keystore generated or EAS Managed selected
- [ ] Keystore uploaded to EAS (`eas credentials`)
- [ ] Play Console app created (optional)
- [ ] Google Play service account configured (optional)

### iOS Signing

- [ ] Apple Developer account available
- [ ] Bundle ID registered (`com.pimcore.voyager`)
- [ ] Distribution certificate created
- [ ] Provisioning profile created
- [ ] Certificates uploaded to EAS
- [ ] App created in App Store Connect

### TestFlight (Optional)

- [ ] `EXPO_APPLE_ID` secret added
- [ ] `EXPO_APPLE_APP_SPECIFIC_PASSWORD` secret added
- [ ] `ENABLE_TESTFLIGHT_DEPLOY` variable set
- [ ] TestFlight upload tested

## 🔄 Workflows Overview

### `build.yml` - Standard Build

**Trigger:**
- Push to `main`/`develop`
- Pull requests
- Manual

**Duration:** ~5-10 minutes (without waiting for EAS)

**Output:** Build link to the EAS dashboard

### `build-artifacts.yml` - Build with Downloads

**Trigger:**
- Manual
- GitHub Release

**Duration:** ~20-60 minutes (waits for the build)

**Output:** APK/IPA as GitHub artifacts

## 🎯 Typical Workflows

### Development

```bash
# Local development build
eas build --platform android --profile development --local
```

### Testing

```bash
# CI build via GitHub Actions
# → Actions → "Build and Deploy" → Run workflow
# Platform: all, Profile: preview
```

### Release

```bash
# 1. Create a tag
git tag v1.0.0
git push origin v1.0.0

# 2. Create a GitHub Release
# → Triggers build-artifacts.yml automatically

# 3. Download APK/IPA from the release
```

## 🛠️ Common Tasks

### Check Build Status

```bash
# Via EAS Dashboard
https://expo.dev/accounts/[username]/projects/pimcore-voyager/builds

# Via CLI
eas build:list
```

### Manage Credentials

```bash
# Android
eas credentials --platform android

# iOS
eas credentials --platform ios
```

### Download a Build

```bash
# Via CLI
eas build:view [BUILD_ID]

# Via Dashboard
https://expo.dev → Project → Builds → Download
```

## 📖 Further Documentation

### External Resources

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

### Pimcore Voyager

- [README.md](../README.md) - Project overview
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Development guide

## 🆘 Support

### Problems with Builds?

1. ✅ Check [Troubleshooting](./CI-CD-SETUP.md#troubleshooting)
2. ✅ Look at the [Build Logs](#check-build-status)
3. ✅ Search the [Expo Forums](https://forums.expo.dev/)
4. ✅ Create an issue in this repo

### Questions?

- GitHub Issues: [PimcoreVoyager Issues](https://github.com/dpfaffenbauer/PimcoreVoyager/issues)
- Expo Community: [Expo Forums](https://forums.expo.dev/)
- Expo Discord: [discord.gg/expo](https://discord.gg/expo)

## 📝 Changelog

### 2025-12-27 - Initial Setup
- ✅ Basic workflows created
- ✅ EAS integration
- ✅ Android/iOS build support
- ✅ Artifact upload
- ✅ TestFlight integration (optional)
- ✅ Complete documentation

---

**Next steps:** Start with [SECRETS-SETUP.md](./SECRETS-SETUP.md) 🚀
