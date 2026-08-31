# Setup Checklist: Pimcore Voyager CI/CD

This checklist guides you through the complete setup process for the CI/CD pipeline.

## Phase 1: Preparations (15 minutes)

### 1.1 Create Accounts

- [ ] **Expo Account**
  - Registration: https://expo.dev
  - Email verified
  - Account name noted: `_______________`

- [ ] **Apple Developer Account** (for iOS, $99/year)
  - Registration: https://developer.apple.com
  - Account verified
  - Team ID noted: `_______________`

- [ ] **Google Play Console Account** (for Android, $25 one-time)
  - Registration: https://play.google.com/console
  - Account verified
  - Developer Account ID noted: `_______________`

### 1.2 Install Local Tools

- [ ] **Node.js** (v18+)
  ```bash
  node --version  # Should be v18+
  ```

- [ ] **npm** or **yarn**
  ```bash
  npm --version
  ```

- [ ] **Git**
  ```bash
  git --version
  ```

- [ ] **EAS CLI**
  ```bash
  npm install -g eas-cli
  eas --version
  ```

- [ ] **Expo CLI** (optional, for local development)
  ```bash
  npm install -g expo-cli
  expo --version
  ```

## Phase 2: Repository Setup (10 minutes)

### 2.1 Prepare the Repository

- [ ] Repository cloned
  ```bash
  git clone https://github.com/dpfaffenbauer/PimcoreVoyager.git
  cd PimcoreVoyager
  ```

- [ ] Dependencies installed
  ```bash
  npm install
  ```

- [ ] App tested locally
  ```bash
  npm start
  ```

### 2.2 Initialize EAS

- [ ] Signed in to Expo
  ```bash
  eas login
  ```

- [ ] Project initialized
  ```bash
  eas init
  ```

- [ ] Project ID updated in `app.json`
  ```json
  {
    "expo": {
      "extra": {
        "eas": {
          "projectId": "your-project-id-here"
        }
      }
    }
  }
  ```

- [ ] Bundle identifiers adjusted (if necessary)
  - iOS: `app.json` → `expo.ios.bundleIdentifier`
  - Android: `app.json` → `expo.android.package`

## Phase 3: GitHub Secrets (10 minutes)

### 3.1 Create Expo Token

- [ ] Expo access token generated
  - Website: https://expo.dev/accounts/[username]/settings/access-tokens
  - Token name: `GitHub Actions`
  - Token copied: `_______________`

- [ ] GitHub Secret added
  - Repository → Settings → Secrets → Actions
  - Name: `EXPO_TOKEN`
  - Value: [your-token]

### 3.2 Apple Secrets (Optional - for TestFlight)

- [ ] `EXPO_APPLE_ID`
  - Value: your Apple ID email

- [ ] `EXPO_APPLE_APP_SPECIFIC_PASSWORD`
  - Generated at: https://appleid.apple.com
  - Security → App-Specific Passwords
  - Value: xxxx-xxxx-xxxx-xxxx

### 3.3 Repository Variable (Optional)

- [ ] `ENABLE_TESTFLIGHT_DEPLOY`
  - Repository → Settings → Secrets → Variables
  - Name: `ENABLE_TESTFLIGHT_DEPLOY`
  - Value: `true`

## Phase 4: Android Setup (20 minutes)

### 4.1 Create Keystore

**Option A: EAS Managed (Recommended)**

- [ ] Credentials manager started
  ```bash
  eas credentials --platform android
  ```

- [ ] "Set up new Android Keystore" selected
- [ ] "Generate new keystore" selected
- [ ] Keystore generated successfully
- [ ] Keystore details noted

**Option B: Custom Keystore**

- [ ] Keystore generated
  ```bash
  keytool -genkeypair -v -storetype PKCS12 \
    -keystore pimcore-voyager-release.keystore \
    -alias pimcore-voyager \
    -keyalg RSA -keysize 2048 -validity 10000
  ```

- [ ] Keystore secured (backup created)
- [ ] Keystore details noted:
  - Keystore Password: `_______________`
  - Key Alias: `_______________`
  - Key Password: `_______________`

- [ ] Keystore uploaded to EAS
  ```bash
  eas credentials --platform android
  # Select "Upload existing keystore"
  ```

### 4.2 Play Console Setup (Optional)

- [ ] App created in Play Console
  - Package name: `com.pimcore.voyager` (must match app.json)
  - App name: `Pimcore Voyager`

- [ ] App signing enabled (Google Play App Signing recommended)

- [ ] Service account created (for automatic upload)
  - Play Console → Setup → API Access
  - Service account key (.json) downloaded

## Phase 5: iOS Setup (30 minutes)

### 5.1 Apple Developer Portal

- [ ] Bundle ID registered
  - Portal: https://developer.apple.com/account/resources/identifiers
  - Bundle ID: `com.pimcore.voyager`
  - Capabilities selected

### 5.2 Certificates & Profiles

**Option A: EAS Managed (Recommended)**

- [ ] Credentials manager started
  ```bash
  eas credentials --platform ios
  ```

- [ ] "Set up new iOS distribution certificate" selected
- [ ] Apple ID and password entered
- [ ] Certificate generated
- [ ] Provisioning profile generated
- [ ] Credentials details noted

**Option B: Manual Certificates**

- [ ] Distribution certificate created
  - CSR generated (via Keychain or OpenSSL)
  - Certificate created at developer.apple.com
  - Exported as .p12
  - .p12 password noted: `_______________`

- [ ] Provisioning profile created
  - Type: App Store or Ad Hoc
  - Bundle ID: `com.pimcore.voyager` selected
  - Certificate selected
  - .mobileprovision downloaded

- [ ] Credentials uploaded to EAS
  ```bash
  eas credentials --platform ios
  # Select "Upload existing certificate"
  # Select "Upload existing provisioning profile"
  ```

### 5.3 App Store Connect

- [ ] App created
  - Website: https://appstoreconnect.apple.com
  - Name: `Pimcore Voyager`
  - Bundle ID: `com.pimcore.voyager`
  - SKU: unique ID

- [ ] App information filled in (optional, for a later submit)
  - Screenshots prepared
  - Description written
  - Keywords defined

## Phase 6: First Build Test (10 minutes)

### 6.1 Local Test Build

- [ ] Development build started (optional)
  ```bash
  eas build --platform android --profile development
  ```

- [ ] Build successful
- [ ] Build ID noted: `_______________`

### 6.2 GitHub Actions Test

- [ ] GitHub Actions UI opened
  - Repository → Actions tab

- [ ] "Build and Deploy" workflow opened

- [ ] Workflow started manually
  - Clicked "Run workflow"
  - Platform: `android` selected
  - Profile: `preview` selected
  - Workflow started

- [ ] Workflow completed successfully
- [ ] No errors in logs
- [ ] Build ID found in logs

### 6.3 Check EAS Dashboard

- [ ] EAS dashboard opened
  - https://expo.dev/accounts/[username]/projects/pimcore-voyager/builds

- [ ] Build status: Success
- [ ] Build downloaded (optional)
- [ ] Tested on a device (optional)

## Phase 7: Full Workflow Test (20 minutes)

### 7.1 Test Both Platforms

- [ ] Android build successful
  ```bash
  # Via GitHub Actions or:
  eas build --platform android --profile preview
  ```

- [ ] iOS build successful
  ```bash
  # Via GitHub Actions or:
  eas build --platform ios --profile preview
  ```

### 7.2 Test the Artifact Workflow

- [ ] "Build with Artifacts" workflow started
  - Actions → "Build with Artifacts" → "Run workflow"
  - Platform: `android`
  - Profile: `preview`

- [ ] Workflow completed (can take 20-60 min)
- [ ] Artifact available in Actions
- [ ] Artifact downloaded
- [ ] APK tested

### 7.3 Test Automatic Builds

- [ ] Create a branch
  ```bash
  git checkout -b test/ci-build
  ```

- [ ] Make a small change (e.g. edit the README)
  ```bash
  echo "# Test" >> README.md
  git add README.md
  git commit -m "test: CI build trigger"
  git push origin test/ci-build
  ```

- [ ] Pull request created
- [ ] CI build started automatically
- [ ] Build successful
- [ ] PR comment with build status received

## Phase 8: Documentation & Team (15 minutes)

### 8.1 Document Credentials

- [ ] `docs/CREDENTIALS-TEMPLATE.md` filled in
- [ ] Stored in a password manager
- [ ] Team access configured (if a team setup)

### 8.2 Create Backups

- [ ] Android keystore backed up
  - Encrypted backup created
  - Stored in a secure location
  - Backup location documented: `_______________`

- [ ] iOS certificates backed up
  - .p12 file backed up
  - .mobileprovision backed up
  - Stored in a secure location

### 8.3 Inform the Team

- [ ] Team informed about the new CI/CD process
- [ ] Documentation shared
  - [docs/CI-CD-SETUP.md](./CI-CD-SETUP.md)
  - [docs/SECRETS-SETUP.md](./SECRETS-SETUP.md)
- [ ] Quick-start guide created (optional)

## Phase 9: Monitoring & Maintenance Setup (10 minutes)

### 9.1 Set Up Monitoring

- [ ] GitHub Actions notifications enabled
  - Settings → Notifications → Actions
  - Email notifications on failures

- [ ] EAS build notifications (optional)
  - Expo Dashboard → Project Settings → Notifications

### 9.2 Set Calendar Reminders

- [ ] iOS certificate renewal (annually)
  - Date: `_______________`

- [ ] iOS provisioning profile renewal (annually)
  - Date: `_______________`

- [ ] Android keystore password rotation (every 2-3 years)
  - Date: `_______________`

- [ ] Expo token rotation (every 6-12 months)
  - Date: `_______________`

## Phase 10: Production & Store Deployment (Optional)

### 10.1 Production Builds

- [ ] Android production build
  ```bash
  eas build --platform android --profile production
  ```

- [ ] iOS production build
  ```bash
  eas build --platform ios --profile production
  ```

### 10.2 Store Submission

- [ ] **Google Play Store** (optional)
  ```bash
  eas submit --platform android
  ```
  - Or manual upload in the Play Console

- [ ] **Apple App Store / TestFlight** (optional)
  ```bash
  eas submit --platform ios
  ```
  - Or manual upload in App Store Connect

### 10.3 Release Testing

- [ ] TestFlight beta test (iOS)
  - Internal testers added
  - Build tested
  - Feedback collected

- [ ] Internal track test (Android)
  - Internal testers added
  - APK tested
  - Feedback collected

## ✅ Final Checklist

Make sure all critical items are checked off:

- [ ] ✅ EAS CLI installed and working
- [ ] ✅ Project initialized with EAS
- [ ] ✅ GitHub Secret `EXPO_TOKEN` set
- [ ] ✅ Android keystore configured
- [ ] ✅ iOS certificates configured (if iOS deployment is desired)
- [ ] ✅ At least one successful build on EAS
- [ ] ✅ GitHub Actions workflow completed successfully
- [ ] ✅ Credentials backed up and documented
- [ ] ✅ Team informed
- [ ] ✅ Monitoring/notifications set up

## 🎉 Done!

The CI/CD pipeline is now fully set up and ready for operation.

### Next Steps

1. **Regular builds:** Pushing to `main`/`develop` triggers automatic builds
2. **Manual builds:** Use the GitHub Actions UI for on-demand builds
3. **Releases:** Create GitHub Releases for automatic store builds
4. **TestFlight/Beta:** Use preview builds for internal tests
5. **Production:** Deploy to the stores with the production profile

### Support

If you run into problems:
- 📖 See [Troubleshooting](./CI-CD-SETUP.md#troubleshooting)
- 💬 Create an issue on GitHub
- 🔍 Check the [Expo Forums](https://forums.expo.dev/)

---

**Setup completed on:** `_______________`

**Setup performed by:** `_______________`

**Build status:** ✅ Working

**Notes:** `_____________________________________`
