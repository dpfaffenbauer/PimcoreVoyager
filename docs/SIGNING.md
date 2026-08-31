# Signing and Certificates

This document explains the signing of Android and iOS builds in detail.

## Why Signing?

**Android:**
- Every APK/AAB must be signed
- The keystore identifies the publisher
- The same keystore is required for all app updates
- Losing the keystore = no more updates possible

**iOS:**
- Only signed apps can be installed on devices
- The certificate identifies the developer
- The provisioning profile links the app, certificate, and devices
- Annual renewal required (Apple Developer Program)

## Android Signing

### Option 1: EAS Managed Keystore (recommended)

EAS automatically generates and manages keystores.

#### Setup

```bash
# Start the credentials manager
eas credentials

# In the menu:
# 1. Select platform: Android
# 2. Select action: Set up new Android Keystore
# 3. Choose "Generate new keystore"
```

**Advantages:**
- ✅ Automatic generation
- ✅ Secure storage
- ✅ No local keystore file needed
- ✅ Access via your Expo account

**Disadvantages:**
- ⚠️ Tied to your Expo account
- ⚠️ Migrating to another build system is harder

### Option 2: Your Own Keystore

For full control over the keystore.

#### 1. Generate a keystore

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore pimcore-voyager-release.keystore \
  -alias pimcore-voyager \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -storepass YOUR_STORE_PASSWORD \
  -keypass YOUR_KEY_PASSWORD \
  -dname "CN=Pimcore Voyager, OU=Mobile, O=Pimcore, L=City, ST=State, C=DE"
```

**Parameters:**
- `keystore`: File name of the keystore
- `alias`: Unique name for the key pair
- `keyalg`: Algorithm (RSA recommended)
- `keysize`: Key size (2048 bit minimum)
- `validity`: Validity period in days (10000 = ~27 years)
- `storepass`: Password for the keystore file
- `keypass`: Password for the private key
- `dname`: Distinguished name with organization info

#### 2. Display keystore information

```bash
keytool -list -v -keystore pimcore-voyager-release.keystore
```

#### 3. Upload the keystore to EAS

```bash
# Start the credentials manager
eas credentials

# In the menu:
# 1. Select platform: Android
# 2. Select action: Set up new Android Keystore
# 3. Choose "Upload existing keystore"
# 4. Path to the keystore: pimcore-voyager-release.keystore
# 5. Keystore Password: [your-storepass]
# 6. Key Alias: pimcore-voyager
# 7. Key Password: [your-keypass]
```

#### 4. Store the keystore securely

**IMPORTANT:** Create secure backups!

```bash
# Create an encrypted backup (recommended)
gpg -c pimcore-voyager-release.keystore

# Or store in a password manager
# - Keystore file
# - Keystore password
# - Key alias
# - Key password
```

### Keystore Information

Record the following after generation:

```
Keystore file: pimcore-voyager-release.keystore
Keystore Password: [your-storepass]
Key Alias: pimcore-voyager
Key Password: [your-keypass]
SHA-1: XX:XX:XX:... (from keytool -list)
SHA-256: XX:XX:XX:... (from keytool -list)
```

### Play Store Setup

For Play Store deployment:

#### 1. Create the app in the Play Console

1. Go to [play.google.com/console](https://play.google.com/console)
2. Create a new app
3. Package name: `com.pimcore.voyager` (must match app.json)

#### 2. Enable app signing

**Option A: Google Play App Signing (recommended)**

Google manages the final signing key:

1. In the Play Console → Setup → App Integrity
2. Enable app signing
3. Upload the upload key certificate (.der):

```bash
# Extract the certificate from the keystore
keytool -export -rfc \
  -keystore pimcore-voyager-release.keystore \
  -alias pimcore-voyager \
  -file upload-cert.pem
```

4. Google generates the app signing key automatically

**Option B: Traditional app signing**

You keep control over the signing key (not recommended).

#### 3. Create a service account (for automatic upload)

1. In the Play Console → Setup → API Access
2. Create a service account
3. Download the JSON key
4. Store it as the GitHub Secret `GOOGLE_PLAY_SERVICE_ACCOUNT`

## iOS Signing

### Prerequisites

- Apple Developer account ($99/year)
- Bundle ID registered: `com.pimcore.voyager`

### Option 1: EAS Managed Certificates (recommended)

EAS can generate iOS certificates automatically.

#### Setup

```bash
# Start the credentials manager
eas credentials --platform ios

# In the menu:
# 1. Set up a new iOS distribution certificate
# 2. Choose "Generate new certificate"
# 3. Enter your Apple ID and password
# 4. EAS creates the distribution certificate
```

**Advantages:**
- ✅ Automatic generation
- ✅ Automatic provisioning profiles
- ✅ Renewal reminders
- ✅ Push notification keys handled automatically

**Disadvantages:**
- ⚠️ Requires Apple ID credentials
- ⚠️ 2FA can complicate the setup

### Option 2: Manual Certificates

For full control.

#### 1. Create a Certificate Signing Request (CSR)

**On macOS:**

1. Open Keychain Access
2. Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority
3. User Email: your Apple ID
4. Common Name: "Pimcore Voyager Distribution"
5. Saved to disk
6. Save as `PimcoreVoyager.certSigningRequest`

**On Linux/Windows:**

```bash
# Generate a private key
openssl genrsa -out ios-distribution.key 2048

# Create the CSR
openssl req -new -key ios-distribution.key \
  -out PimcoreVoyager.certSigningRequest \
  -subj "/emailAddress=your-email@example.com, CN=Pimcore Voyager Distribution, C=DE"
```

#### 2. Create the distribution certificate

1. Go to [developer.apple.com/account/resources/certificates](https://developer.apple.com/account/resources/certificates)
2. Click "+"
3. Select "Apple Distribution"
4. Continue
5. Upload the CSR file
6. Download the certificate as `distribution.cer`

#### 3. Convert the certificate to .p12

**On macOS:**

1. Double-click `distribution.cer` (imports it into Keychain)
2. In Keychain Access: find "Apple Distribution: ..."
3. Right-click → Export
4. Format: Personal Information Exchange (.p12)
5. Set a password
6. Save as `distribution.p12`

**On Linux:**

```bash
# Convert .cer to .pem
openssl x509 -in distribution.cer -inform DER \
  -out distribution.pem -outform PEM

# Bundle .pem and .key into .p12
openssl pkcs12 -export \
  -out distribution.p12 \
  -inkey ios-distribution.key \
  -in distribution.pem \
  -password pass:YOUR_P12_PASSWORD
```

#### 4. Register the App ID

1. Go to [developer.apple.com/account/resources/identifiers](https://developer.apple.com/account/resources/identifiers)
2. Click "+"
3. Select "App IDs"
4. Type: App
5. Bundle ID: `com.pimcore.voyager` (Explicit)
6. Select capabilities (e.g. Push Notifications)
7. Register

#### 5. Create a provisioning profile

1. Go to [developer.apple.com/account/resources/profiles](https://developer.apple.com/account/resources/profiles)
2. Click "+"
3. Select "App Store" (for production) or "Ad Hoc" (for preview)
4. Select the App ID: `com.pimcore.voyager`
5. Select the certificate: your distribution certificate
6. (For Ad Hoc) select the test devices
7. Name: "Pimcore Voyager App Store" or "Pimcore Voyager AdHoc"
8. Generate and download as `PimcoreVoyager.mobileprovision`

#### 6. Upload the credentials to EAS

```bash
# Start the credentials manager
eas credentials --platform ios

# In the menu:
# 1. Set up a new iOS distribution certificate
# 2. Choose "Upload existing certificate"
# 3. Path to P12: distribution.p12
# 4. P12 Password: [your-p12-password]
# 
# 5. Set up a new iOS provisioning profile
# 6. Choose "Upload existing provisioning profile"
# 7. Path to profile: PimcoreVoyager.mobileprovision
```

### App Store Connect Setup

#### 1. Create the app

1. Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. My Apps → +
3. Name: "Pimcore Voyager"
4. Bundle ID: `com.pimcore.voyager`
5. SKU: any unique ID (e.g. "pimcore-voyager-001")

#### 2. Fill in the app information

- Screenshots (all required sizes)
- App description
- Keywords
- Support URL
- Marketing URL (optional)

#### 3. App Store Connect API key (for automatic upload)

1. App Store Connect → Users and Access → Keys
2. Click "+"
3. Name: "EAS Submit"
4. Access: "App Manager"
5. Generate
6. Download the key file (AuthKey_XXXXXX.p8)
7. Record:
   - Issuer ID
   - Key ID
   - Key file

Needed for EAS Submit:

```bash
eas submit --platform ios
# Asks for:
# - Apple ID
# - App-specific password
# OR
# - ASC API Key
```

## Credential Rotation

### Android

**Annual rotation is not required**, but recommended every 2-3 years:

1. Generate a new keystore
2. Sign the old and new app versions with the new keystore
3. The Play Store accepts the update (with Google Play App Signing)

### iOS

**Annual rotation is required:**

1. The certificate expires after 1 year
2. Provisioning profiles expire after 1 year
3. Renewal:

```bash
# Show the old credentials
eas credentials --platform ios

# Generate new credentials or upload them
eas credentials --platform ios
# Choose "Set up a new iOS distribution certificate"
```

## Troubleshooting

### Android: "Keystore was tampered with, or password was incorrect"

**Cause:** Wrong keystore or key password

**Solution:**
```bash
# Reset the password (only possible if you know the current password)
keytool -storepasswd -keystore pimcore-voyager-release.keystore
keytool -keypasswd -alias pimcore-voyager \
  -keystore pimcore-voyager-release.keystore
```

### iOS: "No valid certificate found"

**Cause:** Certificate expired or not uploaded

**Solution:**
```bash
eas credentials --platform ios
# Upload a new certificate
```

### iOS: "Provisioning profile doesn't include signing certificate"

**Cause:** Provisioning profile does not match the certificate

**Solution:**
1. Delete the old provisioning profile at developer.apple.com
2. Create a new provisioning profile with the current certificate
3. Upload it to EAS

### "Certificate already in use"

**iOS:** Only 2 distribution certificates are allowed per account

**Solution:**
1. Revoke the old certificate at developer.apple.com
2. Create a new certificate
3. Update all provisioning profiles

## Best Practices

### Security

1. ✅ **Never commit keystores/certificates to Git**
2. ✅ **Create secure backups (encrypted)**
3. ✅ **Store passwords in a password manager**
4. ✅ **Use separate keystores for debug/release**
5. ✅ **Enable 2FA for your Apple Developer account**

### Credential Management

1. ✅ **Document all credentials**
2. ✅ **Set calendar reminders for renewals**
3. ✅ **Test signing after every rotation**
4. ✅ **Keep the EAS credentials up to date**

### Team Access

1. ✅ **Use EAS for shared credential access**
2. ✅ **Restrict access to production keystores**
3. ✅ **Document who has access**

## Further Resources

- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [iOS Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [EAS Credentials Documentation](https://docs.expo.dev/app-signing/managed-credentials/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
