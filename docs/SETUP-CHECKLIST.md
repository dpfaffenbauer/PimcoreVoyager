# Setup-Checkliste: Pimcore Voyager CI/CD

Diese Checkliste führt dich durch den kompletten Setup-Prozess der CI/CD-Pipeline.

## Phase 1: Vorbereitungen (15 Minuten)

### 1.1 Accounts erstellen

- [ ] **Expo Account**
  - Registrierung: https://expo.dev
  - Email verifiziert
  - Account-Name notiert: `_______________`

- [ ] **Apple Developer Account** (für iOS, $99/Jahr)
  - Registrierung: https://developer.apple.com
  - Account verifiziert
  - Team ID notiert: `_______________`

- [ ] **Google Play Console Account** (für Android, $25 einmalig)
  - Registrierung: https://play.google.com/console
  - Account verifiziert
  - Developer Account ID notiert: `_______________`

### 1.2 Lokale Tools installieren

- [ ] **Node.js** (v18+)
  ```bash
  node --version  # Sollte v18+ sein
  ```

- [ ] **npm** oder **yarn**
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

- [ ] **Expo CLI** (optional, für lokale Entwicklung)
  ```bash
  npm install -g expo-cli
  expo --version
  ```

## Phase 2: Repository Setup (10 Minuten)

### 2.1 Repository vorbereiten

- [ ] Repository geklont
  ```bash
  git clone https://github.com/dpfaffenbauer/PimcoreVoyager.git
  cd PimcoreVoyager
  ```

- [ ] Dependencies installiert
  ```bash
  npm install
  ```

- [ ] App lokal getestet
  ```bash
  npm start
  ```

### 2.2 EAS initialisieren

- [ ] Bei Expo angemeldet
  ```bash
  eas login
  ```

- [ ] Projekt initialisiert
  ```bash
  eas init
  ```

- [ ] Projekt-ID in `app.json` aktualisiert
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

- [ ] Bundle Identifiers angepasst (falls nötig)
  - iOS: `app.json` → `expo.ios.bundleIdentifier`
  - Android: `app.json` → `expo.android.package`

## Phase 3: GitHub Secrets (10 Minuten)

### 3.1 Expo Token erstellen

- [ ] Expo Access Token generiert
  - Website: https://expo.dev/accounts/[username]/settings/access-tokens
  - Token-Name: `GitHub Actions`
  - Token kopiert: `_______________`

- [ ] GitHub Secret hinzugefügt
  - Repository → Settings → Secrets → Actions
  - Name: `EXPO_TOKEN`
  - Value: [dein-token]

### 3.2 Apple Secrets (Optional - für TestFlight)

- [ ] `EXPO_APPLE_ID`
  - Value: deine Apple ID Email

- [ ] `EXPO_APPLE_APP_SPECIFIC_PASSWORD`
  - Generiert bei: https://appleid.apple.com
  - Sicherheit → App-spezifische Passwörter
  - Value: xxxx-xxxx-xxxx-xxxx

### 3.3 Repository Variable (Optional)

- [ ] `ENABLE_TESTFLIGHT_DEPLOY`
  - Repository → Settings → Secrets → Variables
  - Name: `ENABLE_TESTFLIGHT_DEPLOY`
  - Value: `true`

## Phase 4: Android Setup (20 Minuten)

### 4.1 Keystore erstellen

**Option A: EAS Managed (Empfohlen)**

- [ ] Credentials Manager gestartet
  ```bash
  eas credentials --platform android
  ```

- [ ] "Set up new Android Keystore" gewählt
- [ ] "Generate new keystore" gewählt
- [ ] Keystore erfolgreich generiert
- [ ] Keystore-Details notiert

**Option B: Eigener Keystore**

- [ ] Keystore generiert
  ```bash
  keytool -genkeypair -v -storetype PKCS12 \
    -keystore pimcore-voyager-release.keystore \
    -alias pimcore-voyager \
    -keyalg RSA -keysize 2048 -validity 10000
  ```

- [ ] Keystore gesichert (Backup erstellt)
- [ ] Keystore-Details notiert:
  - Keystore Password: `_______________`
  - Key Alias: `_______________`
  - Key Password: `_______________`

- [ ] Keystore zu EAS hochgeladen
  ```bash
  eas credentials --platform android
  # "Upload existing keystore" wählen
  ```

### 4.2 Play Console Setup (Optional)

- [ ] App in Play Console erstellt
  - Package Name: `com.pimcore.voyager` (muss mit app.json übereinstimmen)
  - App-Name: `Pimcore Voyager`

- [ ] App Signing aktiviert (Google Play App Signing empfohlen)

- [ ] Service Account erstellt (für automatischen Upload)
  - Play Console → Setup → API Access
  - Service Account Key (.json) heruntergeladen

## Phase 5: iOS Setup (30 Minuten)

### 5.1 Apple Developer Portal

- [ ] Bundle ID registriert
  - Portal: https://developer.apple.com/account/resources/identifiers
  - Bundle ID: `com.pimcore.voyager`
  - Capabilities ausgewählt

### 5.2 Certificates & Profiles

**Option A: EAS Managed (Empfohlen)**

- [ ] Credentials Manager gestartet
  ```bash
  eas credentials --platform ios
  ```

- [ ] "Set up new iOS distribution certificate" gewählt
- [ ] Apple ID und Passwort eingegeben
- [ ] Certificate generiert
- [ ] Provisioning Profile generiert
- [ ] Credentials-Details notiert

**Option B: Manuelle Certificates**

- [ ] Distribution Certificate erstellt
  - CSR generiert (via Keychain oder OpenSSL)
  - Certificate bei developer.apple.com erstellt
  - Als .p12 exportiert
  - .p12 Password notiert: `_______________`

- [ ] Provisioning Profile erstellt
  - Typ: App Store oder Ad Hoc
  - Bundle ID: `com.pimcore.voyager` ausgewählt
  - Certificate ausgewählt
  - .mobileprovision heruntergeladen

- [ ] Credentials zu EAS hochgeladen
  ```bash
  eas credentials --platform ios
  # "Upload existing certificate" wählen
  # "Upload existing provisioning profile" wählen
  ```

### 5.3 App Store Connect

- [ ] App erstellt
  - Website: https://appstoreconnect.apple.com
  - Name: `Pimcore Voyager`
  - Bundle ID: `com.pimcore.voyager`
  - SKU: eindeutige ID

- [ ] App-Informationen ausgefüllt (optional, für späteren Submit)
  - Screenshots vorbereitet
  - Beschreibung geschrieben
  - Keywords definiert

## Phase 6: Erster Build-Test (10 Minuten)

### 6.1 Lokaler Test-Build

- [ ] Development Build gestartet (optional)
  ```bash
  eas build --platform android --profile development
  ```

- [ ] Build erfolgreich
- [ ] Build-ID notiert: `_______________`

### 6.2 GitHub Actions Test

- [ ] GitHub Actions UI geöffnet
  - Repository → Actions Tab

- [ ] "Build and Deploy" Workflow geöffnet

- [ ] Workflow manuell gestartet
  - "Run workflow" geklickt
  - Platform: `android` gewählt
  - Profile: `preview` gewählt
  - Workflow gestartet

- [ ] Workflow erfolgreich abgeschlossen
- [ ] Keine Fehler in Logs
- [ ] Build-ID in Logs gefunden

### 6.3 EAS Dashboard prüfen

- [ ] EAS Dashboard geöffnet
  - https://expo.dev/accounts/[username]/projects/pimcore-voyager/builds

- [ ] Build-Status: Success
- [ ] Build heruntergeladen (optional)
- [ ] Auf Gerät getestet (optional)

## Phase 7: Vollständiger Workflow-Test (20 Minuten)

### 7.1 Beide Platforms testen

- [ ] Android Build erfolgreich
  ```bash
  # Via GitHub Actions oder:
  eas build --platform android --profile preview
  ```

- [ ] iOS Build erfolgreich
  ```bash
  # Via GitHub Actions oder:
  eas build --platform ios --profile preview
  ```

### 7.2 Artifact-Workflow testen

- [ ] "Build with Artifacts" Workflow gestartet
  - Actions → "Build with Artifacts" → "Run workflow"
  - Platform: `android`
  - Profile: `preview`

- [ ] Workflow abgeschlossen (kann 20-60 Min dauern)
- [ ] Artifact in Actions verfügbar
- [ ] Artifact heruntergeladen
- [ ] APK getestet

### 7.3 Automatische Builds testen

- [ ] Branch erstellen
  ```bash
  git checkout -b test/ci-build
  ```

- [ ] Kleine Änderung machen (z.B. README editieren)
  ```bash
  echo "# Test" >> README.md
  git add README.md
  git commit -m "test: CI build trigger"
  git push origin test/ci-build
  ```

- [ ] Pull Request erstellen
- [ ] CI-Build automatisch gestartet
- [ ] Build erfolgreich
- [ ] PR-Kommentar mit Build-Status erhalten

## Phase 8: Dokumentation & Team (15 Minuten)

### 8.1 Credentials dokumentieren

- [ ] `docs/CREDENTIALS-TEMPLATE.md` ausgefüllt
- [ ] In Passwort-Manager gespeichert
- [ ] Team-Zugriff konfiguriert (falls Team-Setup)

### 8.2 Backups erstellen

- [ ] Android Keystore gesichert
  - Verschlüsseltes Backup erstellt
  - An sicherem Ort gespeichert
  - Backup-Location dokumentiert: `_______________`

- [ ] iOS Certificates gesichert
  - .p12 Datei gesichert
  - .mobileprovision gesichert
  - An sicherem Ort gespeichert

### 8.3 Team informieren

- [ ] Team über neuen CI/CD-Prozess informiert
- [ ] Dokumentation geteilt
  - [docs/CI-CD-SETUP.md](./CI-CD-SETUP.md)
  - [docs/SECRETS-SETUP.md](./SECRETS-SETUP.md)
- [ ] Quick-Start-Guide erstellt (optional)

## Phase 9: Monitoring & Wartung Setup (10 Minuten)

### 9.1 Monitoring einrichten

- [ ] GitHub Actions Notifications aktiviert
  - Settings → Notifications → Actions
  - Email-Benachrichtigungen bei Failures

- [ ] EAS Build Notifications (optional)
  - Expo Dashboard → Project Settings → Notifications

### 9.2 Kalender-Reminder setzen

- [ ] iOS Certificate Renewal (jährlich)
  - Datum: `_______________`

- [ ] iOS Provisioning Profile Renewal (jährlich)
  - Datum: `_______________`

- [ ] Android Keystore Password Rotation (alle 2-3 Jahre)
  - Datum: `_______________`

- [ ] Expo Token Rotation (alle 6-12 Monate)
  - Datum: `_______________`

## Phase 10: Produktion & Store Deployment (Optional)

### 10.1 Production Builds

- [ ] Android Production Build
  ```bash
  eas build --platform android --profile production
  ```

- [ ] iOS Production Build
  ```bash
  eas build --platform ios --profile production
  ```

### 10.2 Store Submission

- [ ] **Google Play Store** (optional)
  ```bash
  eas submit --platform android
  ```
  - Oder manueller Upload in Play Console

- [ ] **Apple App Store / TestFlight** (optional)
  ```bash
  eas submit --platform ios
  ```
  - Oder manueller Upload in App Store Connect

### 10.3 Release Testing

- [ ] TestFlight Beta Test (iOS)
  - Interne Tester hinzugefügt
  - Build getestet
  - Feedback gesammelt

- [ ] Internal Track Test (Android)
  - Interne Tester hinzugefügt
  - APK getestet
  - Feedback gesammelt

## ✅ Abschluss-Checkliste

Stelle sicher, dass alle kritischen Punkte abgehakt sind:

- [ ] ✅ EAS CLI installiert und funktioniert
- [ ] ✅ Projekt mit EAS initialisiert
- [ ] ✅ GitHub Secret `EXPO_TOKEN` gesetzt
- [ ] ✅ Android Keystore konfiguriert
- [ ] ✅ iOS Certificates konfiguriert (falls iOS-Deployment gewünscht)
- [ ] ✅ Mindestens ein erfolgreicher Build auf EAS
- [ ] ✅ GitHub Actions Workflow erfolgreich durchgelaufen
- [ ] ✅ Credentials gesichert und dokumentiert
- [ ] ✅ Team informiert
- [ ] ✅ Monitoring/Notifications eingerichtet

## 🎉 Fertig!

Die CI/CD-Pipeline ist jetzt vollständig eingerichtet und betriebsbereit.

### Nächste Schritte

1. **Regelmäßige Builds:** Push zu `main`/`develop` triggert automatische Builds
2. **Manuelle Builds:** Nutze GitHub Actions UI für On-Demand-Builds
3. **Releases:** Erstelle GitHub Releases für automatische Store-Builds
4. **TestFlight/Beta:** Nutze Preview-Builds für interne Tests
5. **Production:** Deploy zu Stores mit Production-Profil

### Support

Bei Problemen:
- 📖 Siehe [Troubleshooting](./CI-CD-SETUP.md#troubleshooting)
- 💬 Erstelle Issue auf GitHub
- 🔍 Prüfe [Expo Forums](https://forums.expo.dev/)

---

**Setup abgeschlossen am:** `_______________`

**Setup durchgeführt von:** `_______________`

**Build-Status:** ✅ Funktioniert

**Notizen:** `_____________________________________`
