# Build Process Documentation

This document explains the detailed build process for Android and iOS with EAS Build.

## Build Architecture

```
┌─────────────────┐
│  GitHub Action  │
│   (Trigger)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Setup Node    │
│   Install Deps  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Setup EAS CLI  │
│  (expo-github-  │
│     action)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  eas build      │
│  --platform X   │
│  --profile Y    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  EAS Build      │
│  Servers        │
│  (Cloud Build)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Build Output   │
│  (APK/IPA)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Upload to      │
│  GitHub         │
│  Artifacts      │
└─────────────────┘
```

## Build Types

### 1. Standard Build (`build.yml`)

**Purpose:** Fast builds without waiting for completion

**Workflow:**
1. Code checkout
2. Install dependencies
3. Start EAS build
4. Output the build ID in the logs
5. Finish the workflow (no waiting)

**Use for:**
- Development
- CI checks
- Fast iterations

**Build download:**
Builds must be downloaded manually from the [EAS Dashboard](https://expo.dev).

### 2. Artifact Build (`build-artifacts.yml`)

**Purpose:** Full build with artifact upload

**Workflow:**
1. Code checkout
2. Install dependencies
3. Start EAS build
4. **Wait for build completion (up to 60 min)**
5. Download the build artifact
6. Upload it as a GitHub artifact
7. Optional: attach it to a GitHub Release

**Use for:**
- Releases
- Distribution
- TestFlight/Play Store preparation

## Build Profiles in Detail

### Development Profile

```json
{
  "developmentClient": true,
  "distribution": "internal",
  "ios": {
    "buildConfiguration": "Debug"
  },
  "android": {
    "buildType": "apk"
  }
}
```

**Characteristics:**
- Includes debug symbols
- Faster builds
- Expo Development Client enabled
- For internal testing only

### Preview Profile

```json
{
  "distribution": "internal",
  "ios": {
    "simulator": false,
    "buildConfiguration": "Release"
  },
  "android": {
    "buildType": "apk"
  }
}
```

**Characteristics:**
- Release build
- Optimized code
- For internal distribution (Ad Hoc iOS, APK Android)
- TestFlight-ready

### Production Profile

```json
{
  "ios": {
    "buildConfiguration": "Release"
  },
  "android": {
    "buildType": "apk"
  }
}
```

**Characteristics:**
- Fully optimized
- Store-ready
- App Store / Play Store deployment

## Environment Variables

### Available in GitHub Actions

| Variable | Description | Example |
|----------|--------------|----------|
| `EXPO_TOKEN` | Expo access token | `xxx-xxx-xxx` |
| `GITHUB_REF` | Git reference | `refs/heads/main` |
| `GITHUB_SHA` | Commit SHA | `abc123...` |
| `GITHUB_RUN_ID` | Workflow run ID | `123456` |

### Usable in eas.json

Environment variables can be set in build profiles:

```json
{
  "build": {
    "production": {
      "env": {
        "API_URL": "https://api.example.com",
        "ENV": "production"
      }
    }
  }
}
```

## EAS Build Commands

### Most Important Commands

```bash
# Start a build
eas build --platform android --profile preview

# Check build status
eas build:view [BUILD_ID]

# Show list of builds
eas build:list

# Manage credentials
eas credentials

# Show credentials
eas credentials -p android
eas credentials -p ios
```

### Flags

| Flag | Description |
|------|--------------|
| `--platform` | android, ios, or all |
| `--profile` | Build profile from eas.json |
| `--non-interactive` | No interactive prompts |
| `--no-wait` | Do not wait for build completion |
| `--json` | JSON output |
| `--local` | Local build (without EAS servers) |

## Build Times

Typical durations (on EAS servers):

| Platform | Profile | Approximate Duration |
|----------|---------|-----------------|
| Android | Development | 8-12 min |
| Android | Preview/Production | 10-15 min |
| iOS | Development | 12-18 min |
| iOS | Preview/Production | 15-25 min |

**Factors affecting build time:**
- Number of dependencies
- Native modules
- Asset size
- EAS server load

## Debugging

### Retrieving Build Logs

1. **From GitHub Actions:**
   - Go to the Actions tab
   - Select the workflow run
   - Click the job
   - Scroll to the "Build with EAS" step

2. **From the EAS Dashboard:**
   - Go to [expo.dev](https://expo.dev)
   - Navigate to your project
   - Click "Builds"
   - Select the build
   - View the full logs

### Common Build Errors

#### 1. "EXPO_TOKEN not set"

**Cause:** GitHub Secret is missing

**Solution:**
```bash
# Generate a token at expo.dev
# Add it as a GitHub Secret
```

#### 2. "No valid credentials found"

**Cause:** Signing is not configured

**Solution:**
```bash
eas credentials
# Follow the instructions
```

#### 3. "Build timed out"

**Cause:** Build takes too long

**Solution:**
- Use `build.yml` instead of `build-artifacts.yml`
- Download artifacts manually from the EAS Dashboard

#### 4. "Provisioning profile expired" (iOS)

**Cause:** Expired iOS provisioning profile

**Solution:**
```bash
eas credentials --platform ios
# Generate a new profile or upload a new one
```

## Performance Optimization

### 1. Dependency Caching

GitHub Actions automatically caches `node_modules`:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Automatic caching
```

### 2. Choosing Build Profiles

- **Development:** For fast iterations
- **Preview:** For testing
- **Production:** Only for final releases

### 3. Parallel Builds

Use a matrix strategy for Android + iOS at the same time:

```yaml
strategy:
  matrix:
    platform: [android, ios]
```

## Next Steps

1. ✅ Understand the build process
2. ✅ Configure signing
3. ✅ Test the first build
4. ✅ Automate deployment

## Further Resources

- [EAS Build Deep Dive](https://docs.expo.dev/build/introduction/)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/learn-github-actions/best-practices-for-github-actions)
