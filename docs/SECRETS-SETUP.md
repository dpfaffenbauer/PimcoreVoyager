# Quickstart: Configure GitHub Secrets

This guide helps you set up all required GitHub Secrets for the CI/CD pipeline.

## Add GitHub Secrets

Navigate to your repository:
```
Settings → Secrets and variables → Actions → New repository secret
```

## Required Secrets

### 1. EXPO_TOKEN (Required)

**What is this?**
The access token for Expo Application Services (EAS).

**How do I get the token?**
1. Go to [expo.dev](https://expo.dev) and sign in
2. Navigate to [expo.dev/accounts/[username]/settings/access-tokens](https://expo.dev/accounts)
3. Click "Create Token"
4. Name: `GitHub Actions`
5. Copy the generated token

**Create the GitHub Secret:**
- Name: `EXPO_TOKEN`
- Value: `[your-expo-token]`

---

## Optional Secrets (for advanced features)

### 2. EXPO_APPLE_ID (Optional - for TestFlight)

**What is this?**
Your Apple ID for TestFlight upload.

**Create the GitHub Secret:**
- Name: `EXPO_APPLE_ID`
- Value: `your-email@example.com`

### 3. EXPO_APPLE_APP_SPECIFIC_PASSWORD (Optional - for TestFlight)

**What is this?**
An app-specific password for your Apple account.

**How do I generate it?**
1. Go to [appleid.apple.com](https://appleid.apple.com)
2. Sign in
3. In the "Security" section → "App-Specific Passwords"
4. Click "+" to generate
5. Label: `EAS Build`
6. Copy the generated password (format: xxxx-xxxx-xxxx-xxxx)

**Create the GitHub Secret:**
- Name: `EXPO_APPLE_APP_SPECIFIC_PASSWORD`
- Value: `xxxx-xxxx-xxxx-xxxx`

---

## Repository Variables (Optional)

### ENABLE_TESTFLIGHT_DEPLOY

To enable automatic TestFlight deployment:

```
Settings → Secrets and variables → Actions → Variables → New repository variable
```

- Name: `ENABLE_TESTFLIGHT_DEPLOY`
- Value: `true`

---

## Validation

After setting up the secrets:

1. Go to the `Actions` tab in your repository
2. Select the "Build and Deploy" workflow
3. Click "Run workflow"
4. Select platform: `android`
5. Select profile: `preview`
6. Click "Run workflow"

If the workflow starts successfully, your secrets are configured correctly! 🎉

---

## Summary

**Minimum configuration (Android/iOS builds only):**
- ✅ `EXPO_TOKEN`

**Full configuration (with TestFlight):**
- ✅ `EXPO_TOKEN`
- ✅ `EXPO_APPLE_ID`
- ✅ `EXPO_APPLE_APP_SPECIFIC_PASSWORD`
- ✅ `ENABLE_TESTFLIGHT_DEPLOY` (variable)

---

## Next Steps

After configuring the secrets:

1. ✅ Read [CI-CD-SETUP.md](./CI-CD-SETUP.md) for the complete documentation
2. ✅ Configure Android/iOS signing with `eas credentials`
3. ✅ Test the first build with GitHub Actions
4. ✅ Set up TestFlight/Play Store deployment (optional)

---

## Problems?

See the [Troubleshooting](./CI-CD-SETUP.md#troubleshooting) section in the main documentation.
