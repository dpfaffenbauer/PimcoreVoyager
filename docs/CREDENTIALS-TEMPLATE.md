# Credentials Template

This file documents all credentials needed for building and deploying Pimcore Voyager.

**⚠️ NEVER commit actual credentials to git!**

## Expo Account

```
Expo Username: _______________
Expo Email: _______________
Expo Project ID: _______________
Expo Access Token: _______________
```

Get from: https://expo.dev

## GitHub Secrets

Required secrets in GitHub repository:

### EXPO_TOKEN
```
Value: [your-expo-access-token]
```

### EXPO_APPLE_ID (Optional - for TestFlight)
```
Value: [your-apple-id@example.com]
```

### EXPO_APPLE_APP_SPECIFIC_PASSWORD (Optional - for TestFlight)
```
Value: [xxxx-xxxx-xxxx-xxxx]
```

## Android Keystore

```
Keystore File: _______________
Keystore Password: _______________
Key Alias: _______________
Key Password: _______________
SHA-1 Fingerprint: _______________
SHA-256 Fingerprint: _______________
```

### Generate Keystore Command

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore pimcore-voyager-release.keystore \
  -alias pimcore-voyager \
  -keyalg RSA -keysize 2048 -validity 10000
```

## iOS Certificates

### Distribution Certificate

```
Certificate File (.p12): _______________
Certificate Password: _______________
Certificate Expiry: _______________
Team ID: _______________
```

### Provisioning Profile

```
Profile Name: _______________
Profile File (.mobileprovision): _______________
Profile Type: [App Store / Ad Hoc]
Profile Expiry: _______________
Bundle ID: com.pimcore.voyager
```

### App Store Connect

```
Apple ID: _______________
App-Specific Password: _______________
Team ID: _______________
ASC App ID: _______________
ASC API Key ID: _______________
ASC API Issuer ID: _______________
ASC API Key File (.p8): _______________
```

## Google Play Console

```
Service Account Email: _______________
Service Account Key File (.json): _______________
Package Name: com.pimcore.voyager
```

## Pimcore Backend

```
API URL: _______________
API Key: _______________
OAuth Client ID: _______________
OAuth Client Secret: _______________
```

## Storage

Securely store all credentials in:

- [ ] Password Manager (1Password, LastPass, Bitwarden, etc.)
- [ ] Encrypted backup (GPG, age, etc.)
- [ ] Team-shared vault (for team access)

## Backup Locations

```
Keystore Backup: _______________
Certificate Backup: _______________
Credentials Document: _______________
Last Updated: _______________
```

## Rotation Schedule

Set reminders for:

- [ ] iOS Certificate Renewal (annually)
- [ ] iOS Provisioning Profile Renewal (annually)
- [ ] Android Keystore Password Rotation (every 2-3 years)
- [ ] API Token Rotation (every 6-12 months)

## Team Access

Document who has access to what:

| Person | Role | Expo | Apple Dev | Google Play | GitHub | 
|--------|------|------|-----------|-------------|--------|
| _____ | _____ | [ ] | [ ] | [ ] | [ ] |
| _____ | _____ | [ ] | [ ] | [ ] | [ ] |

## Notes

```
Additional notes, special configurations, or team-specific information:

_______________________________________________________________

_______________________________________________________________

_______________________________________________________________
```

---

**Last Updated:** _______________

**Updated By:** _______________
