# CI/CD Setup und Konfiguration

Dieses Dokument beschreibt die vollständige Einrichtung der CI/CD-Pipeline für Pimcore Voyager mit GitHub Actions und Expo Application Services (EAS).

## Inhaltsverzeichnis

1. [Übersicht](#übersicht)
2. [Voraussetzungen](#voraussetzungen)
3. [EAS-Konfiguration](#eas-konfiguration)
4. [GitHub Secrets einrichten](#github-secrets-einrichten)
5. [Build-Profile](#build-profile)
6. [Workflows](#workflows)
7. [Android-Signierung](#android-signierung)
8. [iOS-Signierung](#ios-signierung)
9. [Troubleshooting](#troubleshooting)

## Übersicht

Die CI/CD-Pipeline automatisiert den Build- und Deployment-Prozess für Android und iOS mit folgenden Features:

- ✅ Automatische Builds bei Push/Merge auf Hauptbranches
- ✅ Manuelle Builds über GitHub Actions UI
- ✅ EAS Build Integration für Android (APK/AAB) und iOS (IPA)
- ✅ Artifact-Upload zu GitHub Actions
- ✅ Optional: TestFlight Deployment
- ✅ Optional: Release-Automation

## Voraussetzungen

### 1. Expo Account erstellen

1. Registrierung unter [expo.dev](https://expo.dev)
2. Ein neues Projekt erstellen oder bestehendes verknüpfen
3. Access Token generieren:
   - Gehe zu [expo.dev/accounts/[username]/settings/access-tokens](https://expo.dev/accounts)
   - Erstelle einen neuen Token mit Namen "GitHub Actions"
   - Token sicher speichern (wird als GitHub Secret benötigt)

### 2. EAS CLI installieren (lokal)

```bash
npm install -g eas-cli
eas login
```

### 3. Projekt mit EAS initialisieren

```bash
cd /pfad/zu/PimcoreVoyager
eas init
```

Dies aktualisiert die `app.json` mit der Projekt-ID.

## EAS-Konfiguration

Die Datei `eas.json` definiert verschiedene Build-Profile:

### Build-Profile

#### `development`
- Entwicklungs-Builds mit Debug-Konfiguration
- Android: APK
- iOS: Debug-Build

#### `preview`
- Test-Builds für interne Verteilung
- Android: APK
- iOS: Release-Build ohne App Store

#### `production`
- Production-Builds für Store-Verteilung
- Android: APK (oder AAB mit `production-aab` Profil)
- iOS: Release-Build für App Store/TestFlight

### Beispiel `eas.json`

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

## GitHub Secrets einrichten

Navigiere zu: `Settings` → `Secrets and variables` → `Actions` → `New repository secret`

### Erforderliche Secrets

#### 1. `EXPO_TOKEN` (Pflicht)

Der Expo Access Token für EAS Build.

```
Wert: [dein-expo-access-token]
```

#### 2. Android Signierung (Optional für signierte Builds)

Wenn du Android-Builds signieren möchtest, lade den Keystore in EAS hoch:

```bash
eas credentials
```

Folge den Anweisungen zum Hochladen deines Keystores.

Alternativ kannst du die Signierung automatisch von EAS verwalten lassen.

#### 3. iOS Signierung (Optional für iOS Builds)

Für iOS-Builds benötigst du:

- Apple Developer Account
- Distribution Certificate (.p12)
- Provisioning Profile (.mobileprovision)

**Option A: EAS Credentials Manager (empfohlen)**

```bash
eas credentials
```

EAS kann Zertifikate automatisch generieren und verwalten.

**Option B: Manuelle Upload**

```bash
eas credentials --platform ios
```

Folge den Anweisungen zum Hochladen deiner Zertifikate.

#### 4. TestFlight Secrets (Optional)

Für automatisches TestFlight-Deployment:

- `EXPO_APPLE_ID`: Deine Apple ID
- `EXPO_APPLE_APP_SPECIFIC_PASSWORD`: App-spezifisches Passwort

App-spezifisches Passwort generieren:
1. Gehe zu [appleid.apple.com](https://appleid.apple.com)
2. Anmelden → Sicherheit → App-spezifische Passwörter
3. Passwort generieren und als Secret speichern

### Optionale Variablen

#### `ENABLE_TESTFLIGHT_DEPLOY`

Um TestFlight-Deployment zu aktivieren, erstelle eine Repository-Variable:

`Settings` → `Secrets and variables` → `Actions` → `Variables` → `New repository variable`

```
Name: ENABLE_TESTFLIGHT_DEPLOY
Value: true
```

## Workflows

### 1. `build.yml` - Standard Build Workflow

Triggert automatisch bei:
- Push auf `main` oder `develop` Branch
- Pull Requests auf `main` oder `develop`
- Manueller Trigger über Actions UI

**Manuelle Ausführung:**

1. Gehe zu `Actions` → `Build and Deploy`
2. Klicke auf `Run workflow`
3. Wähle Platform (`android`, `ios`, oder `all`)
4. Wähle Build-Profil (`development`, `preview`, oder `production`)
5. Klicke auf `Run workflow`

**Features:**
- Parallele Builds für Android und iOS
- EAS Build Integration
- Build-Status Kommentare auf PRs

### 2. `build-artifacts.yml` - Build mit Artifact-Download

Triggert bei:
- Manueller Trigger über Actions UI
- GitHub Release erstellt

**Features:**
- Wartet auf Build-Completion
- Downloaded fertige APK/IPA Dateien
- Uploaded Artifacts zu GitHub Actions (30 Tage Retention)
- Attached Artifacts an GitHub Releases

**Hinweis:** Dieser Workflow dauert länger (bis zu 60 Minuten), da er auf den EAS-Build wartet.

## Android-Signierung

### Option 1: EAS Managed Credentials (Empfohlen)

EAS generiert und verwaltet automatisch einen Keystore:

```bash
eas credentials
```

Wähle "Set up new Android Keystore" und folge den Anweisungen.

### Option 2: Eigener Keystore

#### Keystore generieren

```bash
keytool -genkeypair -v -storetype PKCS12 \
  -keystore pimcore-voyager.keystore \
  -alias pimcore-voyager \
  -keyalg RSA -keysize 2048 \
  -validity 10000
```

#### Keystore in EAS hochladen

```bash
eas credentials
```

Wähle "Set up new Android Keystore" → "Upload existing keystore".

**Wichtig:** Speichere Keystore-Passwörter sicher! Verlust führt dazu, dass App-Updates nicht mehr möglich sind.

## iOS-Signierung

### Voraussetzungen

- Apple Developer Account ($99/Jahr)
- Xcode auf macOS (für lokale Entwicklung)

### Option 1: EAS Managed Credentials (Empfohlen)

```bash
eas credentials --platform ios
```

EAS kann automatisch:
- Distribution Certificate generieren
- Provisioning Profiles erstellen
- Push Notification Keys verwalten

### Option 2: Manuelle Zertifikate

#### 1. Distribution Certificate erstellen

1. Öffne [developer.apple.com/account/resources/certificates](https://developer.apple.com/account/resources/certificates)
2. Erstelle "iOS Distribution Certificate"
3. Download als `.cer`, konvertiere zu `.p12`:

```bash
# Auf macOS mit Keychain Access
# Exportiere als .p12 mit Passwort
```

#### 2. Provisioning Profile erstellen

1. Öffne [developer.apple.com/account/resources/profiles](https://developer.apple.com/account/resources/profiles)
2. Erstelle "App Store" oder "Ad Hoc" Profil
3. Download als `.mobileprovision`

#### 3. Upload zu EAS

```bash
eas credentials --platform ios
```

Folge den Anweisungen zum Upload.

### App Store Connect konfigurieren

Für TestFlight/App Store Deployment:

1. Erstelle App in [App Store Connect](https://appstoreconnect.apple.com)
2. Bundle Identifier muss mit `app.json` übereinstimmen: `com.pimcore.voyager`
3. Fülle alle erforderlichen App-Informationen aus

## Troubleshooting

### Build schlägt fehl: "Invalid credentials"

**Lösung:**
1. Überprüfe `EXPO_TOKEN` Secret
2. Generiere neuen Token bei [expo.dev](https://expo.dev)
3. Update GitHub Secret

### Android Build Error: "Keystore not found"

**Lösung:**
```bash
eas credentials --platform android
```

Richte Keystore ein oder lasse EAS einen generieren.

### iOS Build Error: "Provisioning profile expired"

**Lösung:**
1. Generiere neues Provisioning Profile bei [developer.apple.com](https://developer.apple.com)
2. Upload mit `eas credentials --platform ios`

### Build dauert sehr lange

EAS Builds können 10-30 Minuten dauern. Dies ist normal.

**Beschleunigung:**
- Nutze `--non-interactive` Flag
- Verwende `preview` Profil für schnellere Test-Builds

### TestFlight Upload schlägt fehl

**Häufige Ursachen:**
- App-spezifisches Passwort falsch
- App nicht in App Store Connect erstellt
- Bundle Identifier stimmt nicht überein

**Lösung:**
1. Überprüfe `EXPO_APPLE_ID` und `EXPO_APPLE_APP_SPECIFIC_PASSWORD` Secrets
2. Stelle sicher, dass App in App Store Connect existiert
3. Überprüfe Bundle Identifier in `app.json`

### Workflow findet Artifact nicht

Der `build-artifacts.yml` Workflow wartet auf Build-Completion. Bei Timeout (60 Min):

**Lösung:**
- Erhöhe `TIMEOUT` Variable im Workflow
- Nutze einfachen `build.yml` Workflow und download Artifacts manuell vom EAS Dashboard

## Weitere Ressourcen

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Android App Signing](https://developer.android.com/studio/publish/app-signing)
- [iOS Code Signing](https://developer.apple.com/support/code-signing/)

## Support

Bei Fragen oder Problemen:
1. Prüfe die [Expo Forums](https://forums.expo.dev/)
2. Erstelle ein Issue in diesem Repository
3. Kontaktiere das Pimcore Voyager Team
