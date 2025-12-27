# Signierung und Zertifikate

Dieses Dokument erklärt die Signierung von Android und iOS Builds im Detail.

## Warum Signierung?

**Android:**
- Jede APK/AAB muss signiert sein
- Keystore identifiziert den Publisher
- Gleicher Keystore für alle App-Updates erforderlich
- Verlust des Keystores = keine Updates mehr möglich

**iOS:**
- Nur signierte Apps können auf Geräten installiert werden
- Certificate identifiziert Entwickler
- Provisioning Profile verknüpft App, Certificate und Geräte
- Jährliche Erneuerung erforderlich (Apple Developer Programm)

## Android Signierung

### Option 1: EAS Managed Keystore (Empfohlen)

EAS generiert und verwaltet automatisch Keystores.

#### Setup

```bash
# Credentials-Manager starten
eas credentials

# Im Menü:
# 1. Select platform: Android
# 2. Select action: Set up new Android Keystore
# 3. Wähle "Generate new keystore"
```

**Vorteile:**
- ✅ Automatische Generierung
- ✅ Sichere Speicherung
- ✅ Keine lokale Keystore-Datei nötig
- ✅ Zugriff über Expo Account

**Nachteile:**
- ⚠️ Gebunden an Expo Account
- ⚠️ Migration zu anderem Build-System schwieriger

### Option 2: Eigener Keystore

Für vollständige Kontrolle über den Keystore.

#### 1. Keystore generieren

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

**Parameter:**
- `keystore`: Dateiname des Keystores
- `alias`: Eindeutiger Name für das Key-Paar
- `keyalg`: Algorithmus (RSA empfohlen)
- `keysize`: Schlüsselgröße (2048 Bit minimum)
- `validity`: Gültigkeitsdauer in Tagen (10000 = ~27 Jahre)
- `storepass`: Passwort für Keystore-Datei
- `keypass`: Passwort für Private Key
- `dname`: Distinguished Name mit Organisations-Info

#### 2. Keystore-Informationen anzeigen

```bash
keytool -list -v -keystore pimcore-voyager-release.keystore
```

#### 3. Keystore zu EAS hochladen

```bash
# Credentials-Manager starten
eas credentials

# Im Menü:
# 1. Select platform: Android
# 2. Select action: Set up new Android Keystore
# 3. Wähle "Upload existing keystore"
# 4. Pfad zum Keystore: pimcore-voyager-release.keystore
# 5. Keystore Password: [dein-storepass]
# 6. Key Alias: pimcore-voyager
# 7. Key Password: [dein-keypass]
```

#### 4. Keystore sicher speichern

**WICHTIG:** Sichere Backups erstellen!

```bash
# Verschlüsseltes Backup erstellen (empfohlen)
gpg -c pimcore-voyager-release.keystore

# Oder in Passwort-Manager speichern
# - Keystore-Datei
# - Keystore Password
# - Key Alias
# - Key Password
```

### Keystore-Informationen

Nach der Generierung notieren:

```
Keystore-Datei: pimcore-voyager-release.keystore
Keystore Password: [dein-storepass]
Key Alias: pimcore-voyager
Key Password: [dein-keypass]
SHA-1: XX:XX:XX:... (aus keytool -list)
SHA-256: XX:XX:XX:... (aus keytool -list)
```

### Play Store Setup

Für Play Store Deployment:

#### 1. App in Play Console erstellen

1. Gehe zu [play.google.com/console](https://play.google.com/console)
2. Erstelle neue App
3. Package Name: `com.pimcore.voyager` (muss mit app.json übereinstimmen)

#### 2. App Signing aktivieren

**Option A: Google Play App Signing (Empfohlen)**

Google verwaltet den finalen Signing Key:

1. In Play Console → Setup → App Integrity
2. App Signing aktivieren
3. Upload Key Certificate (.der) hochladen:

```bash
# Certificate aus Keystore extrahieren
keytool -export -rfc \
  -keystore pimcore-voyager-release.keystore \
  -alias pimcore-voyager \
  -file upload-cert.pem
```

4. Google generiert App Signing Key automatisch

**Option B: Traditionelles App Signing**

Du behältst Kontrolle über Signing Key (nicht empfohlen).

#### 3. Service Account erstellen (für automatischen Upload)

1. In Play Console → Setup → API Access
2. Service Account erstellen
3. JSON Key herunterladen
4. Als GitHub Secret `GOOGLE_PLAY_SERVICE_ACCOUNT` speichern

## iOS Signierung

### Voraussetzungen

- Apple Developer Account ($99/Jahr)
- Bundle ID registriert: `com.pimcore.voyager`

### Option 1: EAS Managed Certificates (Empfohlen)

EAS kann iOS Certificates automatisch generieren.

#### Setup

```bash
# Credentials-Manager starten
eas credentials --platform ios

# Im Menü:
# 1. Set up a new iOS distribution certificate
# 2. Wähle "Generate new certificate"
# 3. Gib Apple ID und Passwort ein
# 4. EAS erstellt Distribution Certificate
```

**Vorteile:**
- ✅ Automatische Generierung
- ✅ Automatische Provisioning Profile
- ✅ Renewal-Erinnerungen
- ✅ Push Notification Keys automatisch

**Nachteile:**
- ⚠️ Benötigt Apple ID Credentials
- ⚠️ 2FA kann Setup verkomplizieren

### Option 2: Manuelle Certificates

Für vollständige Kontrolle.

#### 1. Certificate Signing Request (CSR) erstellen

**Auf macOS:**

1. Öffne Keychain Access
2. Keychain Access → Certificate Assistant → Request a Certificate From a Certificate Authority
3. User Email: deine Apple ID
4. Common Name: "Pimcore Voyager Distribution"
5. Saved to disk
6. Speichere als `PimcoreVoyager.certSigningRequest`

**Auf Linux/Windows:**

```bash
# Private Key generieren
openssl genrsa -out ios-distribution.key 2048

# CSR erstellen
openssl req -new -key ios-distribution.key \
  -out PimcoreVoyager.certSigningRequest \
  -subj "/emailAddress=your-email@example.com, CN=Pimcore Voyager Distribution, C=DE"
```

#### 2. Distribution Certificate erstellen

1. Gehe zu [developer.apple.com/account/resources/certificates](https://developer.apple.com/account/resources/certificates)
2. Klicke auf "+"
3. Wähle "Apple Distribution"
4. Weiter
5. Upload CSR-Datei
6. Certificate herunterladen als `distribution.cer`

#### 3. Certificate zu .p12 konvertieren

**Auf macOS:**

1. Doppelklick auf `distribution.cer` (importiert in Keychain)
2. In Keychain Access: Finde "Apple Distribution: ..."
3. Rechtsklick → Export
4. Format: Personal Information Exchange (.p12)
5. Passwort setzen
6. Speichern als `distribution.p12`

**Auf Linux:**

```bash
# .cer zu .pem konvertieren
openssl x509 -in distribution.cer -inform DER \
  -out distribution.pem -outform PEM

# .pem und .key zu .p12 bündeln
openssl pkcs12 -export \
  -out distribution.p12 \
  -inkey ios-distribution.key \
  -in distribution.pem \
  -password pass:YOUR_P12_PASSWORD
```

#### 4. App ID registrieren

1. Gehe zu [developer.apple.com/account/resources/identifiers](https://developer.apple.com/account/resources/identifiers)
2. Klicke auf "+"
3. Wähle "App IDs"
4. Typ: App
5. Bundle ID: `com.pimcore.voyager` (Explicit)
6. Capabilities auswählen (z.B. Push Notifications)
7. Registrieren

#### 5. Provisioning Profile erstellen

1. Gehe zu [developer.apple.com/account/resources/profiles](https://developer.apple.com/account/resources/profiles)
2. Klicke auf "+"
3. Wähle "App Store" (für Production) oder "Ad Hoc" (für Preview)
4. Wähle App ID: `com.pimcore.voyager`
5. Wähle Certificate: dein Distribution Certificate
6. (Bei Ad Hoc) Wähle Test-Geräte
7. Name: "Pimcore Voyager App Store" oder "Pimcore Voyager AdHoc"
8. Generate und download als `PimcoreVoyager.mobileprovision`

#### 6. Credentials zu EAS hochladen

```bash
# Credentials-Manager starten
eas credentials --platform ios

# Im Menü:
# 1. Set up a new iOS distribution certificate
# 2. Wähle "Upload existing certificate"
# 3. Path to P12: distribution.p12
# 4. P12 Password: [dein-p12-password]
# 
# 5. Set up a new iOS provisioning profile
# 6. Wähle "Upload existing provisioning profile"
# 7. Path to profile: PimcoreVoyager.mobileprovision
```

### App Store Connect Setup

#### 1. App erstellen

1. Gehe zu [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
2. Meine Apps → +
3. Name: "Pimcore Voyager"
4. Bundle ID: `com.pimcore.voyager`
5. SKU: beliebige eindeutige ID (z.B. "pimcore-voyager-001")

#### 2. App-Informationen ausfüllen

- Screenshots (alle erforderlichen Größen)
- App-Beschreibung
- Keywords
- Support-URL
- Marketing-URL (optional)

#### 3. App Store Connect API Key (für automatischen Upload)

1. App Store Connect → Users and Access → Keys
2. Klicke auf "+"
3. Name: "EAS Submit"
4. Access: "App Manager"
5. Generate
6. Download Key-Datei (AuthKey_XXXXXX.p8)
7. Notiere:
   - Issuer ID
   - Key ID
   - Key-Datei

Für EAS Submit benötigt:

```bash
eas submit --platform ios
# Fragt nach:
# - Apple ID
# - App-specific password
# ODER
# - ASC API Key
```

## Credential-Rotation

### Android

**Jährliche Rotation nicht erforderlich**, aber empfohlen alle 2-3 Jahre:

1. Neuen Keystore generieren
2. Alte und neue App-Version mit neuem Keystore signieren
3. Play Store akzeptiert Update (bei Google Play App Signing)

### iOS

**Jährliche Rotation erforderlich:**

1. Certificate läuft nach 1 Jahr ab
2. Provisioning Profiles laufen nach 1 Jahr ab
3. Erneuerung:

```bash
# Alte Credentials anzeigen
eas credentials --platform ios

# Neue Credentials generieren oder upload
eas credentials --platform ios
# Wähle "Set up a new iOS distribution certificate"
```

## Troubleshooting

### Android: "Keystore was tampered with, or password was incorrect"

**Ursache:** Falsches Keystore- oder Key-Passwort

**Lösung:**
```bash
# Passwort zurücksetzen (nur möglich wenn du aktuelles Passwort kennst)
keytool -storepasswd -keystore pimcore-voyager-release.keystore
keytool -keypasswd -alias pimcore-voyager \
  -keystore pimcore-voyager-release.keystore
```

### iOS: "No valid certificate found"

**Ursache:** Certificate abgelaufen oder nicht hochgeladen

**Lösung:**
```bash
eas credentials --platform ios
# Upload neues Certificate
```

### iOS: "Provisioning profile doesn't include signing certificate"

**Ursache:** Provisioning Profile passt nicht zu Certificate

**Lösung:**
1. Lösche altes Provisioning Profile in developer.apple.com
2. Erstelle neues Provisioning Profile mit aktuellem Certificate
3. Upload zu EAS

### "Certificate already in use"

**iOS:** Nur 2 Distribution Certificates pro Account erlaubt

**Lösung:**
1. Revoke altes Certificate in developer.apple.com
2. Erstelle neues Certificate
3. Aktualisiere alle Provisioning Profiles

## Best Practices

### Sicherheit

1. ✅ **Niemals Keystores/Certificates in Git committen**
2. ✅ **Sichere Backups erstellen (verschlüsselt)**
3. ✅ **Passwörter in Passwort-Manager speichern**
4. ✅ **Separate Keystores für Debug/Release**
5. ✅ **2FA für Apple Developer Account aktivieren**

### Credential-Management

1. ✅ **Dokumentiere alle Credentials**
2. ✅ **Setze Kalender-Reminder für Renewals**
3. ✅ **Teste Signing nach jeder Rotation**
4. ✅ **Halte EAS Credentials aktuell**

### Team-Access

1. ✅ **Nutze EAS für geteilten Credential-Zugriff**
2. ✅ **Begrenze Zugriff auf Production-Keystores**
3. ✅ **Dokumentiere wer Zugriff hat**

## Weitere Ressourcen

- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [iOS Code Signing Guide](https://developer.apple.com/support/code-signing/)
- [EAS Credentials Documentation](https://docs.expo.dev/app-signing/managed-credentials/)
- [Play Console Help](https://support.google.com/googleplay/android-developer/)
- [App Store Connect Help](https://developer.apple.com/help/app-store-connect/)
