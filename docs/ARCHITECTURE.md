# CI/CD Pipeline Architektur

## Übersicht

```
┌─────────────────────────────────────────────────────────────────┐
│                        GitHub Repository                          │
│                      dpfaffenbauer/PimcoreVoyager                │
└────────────┬────────────────────────────────────────────────────┘
             │
             │ Push/PR/Workflow Dispatch
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       GitHub Actions                              │
│                                                                   │
│  ┌────────────────────┐         ┌─────────────────────┐        │
│  │   build.yml        │         │ build-artifacts.yml │        │
│  │                    │         │                     │        │
│  │ • Quick builds     │         │ • Full builds       │        │
│  │ • No waiting       │         │ • Downloads APK/IPA │        │
│  │ • CI checks        │         │ • Uploads artifacts │        │
│  └──────────┬─────────┘         └──────────┬──────────┘        │
└─────────────┼────────────────────────────────┼──────────────────┘
              │                                │
              │ eas build                      │ eas build + wait
              ▼                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Expo Application Services (EAS)                │
│                                                                   │
│  ┌──────────────┐                        ┌──────────────┐       │
│  │   Android    │                        │     iOS      │       │
│  │   Builder    │                        │   Builder    │       │
│  │              │                        │              │       │
│  │ • APK Build  │                        │ • IPA Build  │       │
│  │ • AAB Build  │                        │ • Simulator  │       │
│  │ • Signing    │                        │ • Signing    │       │
│  └──────┬───────┘                        └──────┬───────┘       │
└─────────┼──────────────────────────────────────┼────────────────┘
          │                                      │
          │ Build Output                         │ Build Output
          ▼                                      ▼
┌─────────────────────┐               ┌─────────────────────┐
│  Android APK/AAB    │               │     iOS IPA         │
│  Ready to Deploy    │               │  Ready to Deploy    │
└─────────┬───────────┘               └─────────┬───────────┘
          │                                     │
          │                                     │
          ├─────────────┬───────────────────────┼──────────────┐
          │             │                       │              │
          ▼             ▼                       ▼              ▼
  ┌──────────────┐ ┌──────────┐      ┌────────────┐  ┌──────────────┐
  │   GitHub     │ │  Google  │      │  TestFlight│  │    GitHub    │
  │  Artifacts   │ │   Play   │      │   (Apple)  │  │   Releases   │
  │              │ │  Store   │      │            │  │              │
  └──────────────┘ └──────────┘      └────────────┘  └──────────────┘
```

## Workflow-Typen

### 1. Standard Build (`build.yml`)

**Trigger:**
- Push auf `main` oder `develop`
- Pull Request
- Manueller Dispatch

**Ablauf:**
```
1. Checkout Code
2. Setup Node.js (mit npm cache)
3. Install Dependencies (npm ci)
4. Setup Expo/EAS (expo-github-action)
5. Start EAS Build (--no-wait)
6. Return Build ID
7. Optional: Comment on PR
```

**Dauer:** ~5-10 Minuten (wartet nicht auf Build)

**Use Cases:**
- Schnelle CI-Checks
- Entwicklungs-Iterationen
- PR-Validierung

### 2. Artifact Build (`build-artifacts.yml`)

**Trigger:**
- Manueller Dispatch (mit Platform/Profile Auswahl)
- GitHub Release erstellt

**Ablauf:**
```
1. Checkout Code
2. Setup Node.js (mit npm cache)
3. Install Dependencies (npm ci)
4. Setup Expo/EAS (expo-github-action)
5. Start EAS Build
6. Poll Build Status (alle 60s, bis zu 60 Min)
7. Download APK/IPA von Build URL
8. Upload als GitHub Artifact (30 Tage)
9. Optional: Attach zu GitHub Release
10. Generate Build Summary
```

**Dauer:** ~20-60 Minuten (wartet auf Build-Completion)

**Use Cases:**
- Releases
- Distribution
- Finale Builds für Store-Upload

### 3. TestFlight Submit (Optional)

**Trigger:**
- Nach erfolgreichem iOS Build auf `main`
- Nur wenn `ENABLE_TESTFLIGHT_DEPLOY=true`

**Ablauf:**
```
1. Checkout Code
2. Setup Node.js
3. Install Dependencies
4. Setup Expo/EAS
5. Submit letzten Build zu TestFlight (eas submit)
```

**Dauer:** ~5-10 Minuten

**Use Cases:**
- Beta-Testing
- Interne Distribution
- Pre-Release Testing

## Secrets & Credentials Flow

```
┌──────────────────────┐
│  GitHub Repository   │
│     Settings         │
│                      │
│  Secrets:            │
│  • EXPO_TOKEN        │
│  • EXPO_APPLE_ID     │
│  • EXPO_APPLE_...    │
└─────────┬────────────┘
          │
          │ Injected as env vars
          ▼
┌──────────────────────┐
│  GitHub Actions      │
│  Workflow Runtime    │
└─────────┬────────────┘
          │
          │ Passed to EAS CLI
          ▼
┌──────────────────────┐
│  Expo Account        │
│                      │
│  Credentials:        │
│  • Android Keystore  │
│  • iOS Certificate   │
│  • iOS Profile       │
└─────────┬────────────┘
          │
          │ Used during build
          ▼
┌──────────────────────┐
│  EAS Build Servers   │
│                      │
│  • Sign APK/IPA      │
│  • Generate Build    │
└──────────────────────┘
```

## Build-Profile Matrix

| Profile      | Android      | iOS            | Use Case          | Store Ready |
|--------------|--------------|----------------|-------------------|-------------|
| development  | APK (Debug)  | Debug Build    | Development       | ❌           |
| preview      | APK          | Release (AdHoc)| Internal Testing  | ⚠️           |
| production   | APK          | Release        | Store Deployment  | ✅           |
| production-aab| AAB         | Release        | Play Store        | ✅           |

## Platform-spezifische Flows

### Android Build Flow

```
GitHub Actions
    ↓
EAS Build (Ubuntu)
    ↓
1. Install Dependencies
2. Generate Native Project (expo prebuild)
3. Build with Gradle
4. Sign APK/AAB with Keystore
5. Optimize & Align
    ↓
Output: APK or AAB
    ↓
Destinations:
- GitHub Artifacts
- Google Play Console (via eas submit)
- GitHub Releases
```

### iOS Build Flow

```
GitHub Actions
    ↓
EAS Build (macOS)
    ↓
1. Install Dependencies
2. Generate Native Project (expo prebuild)
3. Install CocoaPods
4. Build with Xcode
5. Sign IPA with Certificate + Profile
6. Archive & Export
    ↓
Output: IPA
    ↓
Destinations:
- GitHub Artifacts
- TestFlight (via eas submit)
- App Store Connect
- GitHub Releases
```

## Parallelisierung

### Matrix-Strategie

```yaml
strategy:
  matrix:
    platform: [android, ios]
```

**Vorteile:**
- ✅ Beide Platforms gleichzeitig
- ✅ Halbiert Gesamt-Build-Zeit
- ✅ Unabhängige Jobs

**Build-Zeiten:**
```
Sequential: Android (15 min) + iOS (20 min) = 35 min
Parallel:   max(Android (15 min), iOS (20 min)) = 20 min
```

## Caching-Strategie

### npm Dependencies

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'
```

**Cache-Key:** Hash von `package-lock.json`

**Speed-Up:** 2-3 Minuten pro Build

### EAS Build Cache

EAS cached automatisch:
- Node modules
- Gradle dependencies (Android)
- CocoaPods (iOS)
- Native build artifacts

## Monitoring & Debugging

### Build-Status überprüfen

**EAS Dashboard:**
```
https://expo.dev/accounts/[username]/projects/pimcore-voyager/builds
```

**GitHub Actions:**
```
https://github.com/dpfaffenbauer/PimcoreVoyager/actions
```

### Log-Quellen

1. **GitHub Actions Logs:**
   - Workflow-Ausführung
   - npm install Output
   - EAS CLI Output

2. **EAS Build Logs:**
   - Native Build Output
   - Gradle/Xcode Logs
   - Signing Details

### Fehlersuche

```
Build fehlgeschlagen?
    ↓
1. Check GitHub Actions Logs
    ↓
2. Finde Build ID in Logs
    ↓
3. Check EAS Dashboard mit Build ID
    ↓
4. Analyse voller Build Logs
    ↓
5. Check Common Issues:
   - Invalid Credentials
   - Expired Certificates
   - Dependency Conflicts
   - Platform-specific Errors
```

## Sicherheit

### Secrets-Verwaltung

```
GitHub Secrets (encrypted at rest)
    ↓ HTTPS/TLS
GitHub Actions Runtime (in-memory)
    ↓ HTTPS/TLS
EAS API (authenticated)
    ↓
EAS Build Servers (isolated containers)
```

**Best Practices:**
- ✅ Niemals Secrets in Logs ausgeben
- ✅ `--non-interactive` für alle EAS Commands
- ✅ Secrets regelmäßig rotieren
- ✅ Minimal erforderliche Berechtigungen

### Build-Isolation

Jeder Build läuft in:
- Frischem Container
- Isolierter Umgebung
- Mit temporären Credentials

Nach Build:
- Container gelöscht
- Secrets entfernt
- Nur Artifacts bleiben

## Performance-Metriken

### Typische Build-Zeiten

**GitHub Actions Setup:**
- Checkout: 5-10s
- Node.js Setup: 10-20s
- npm ci (cached): 30-60s
- npm ci (uncached): 2-3 min

**EAS Build:**
- Android Preview: 10-15 min
- Android Production: 12-18 min
- iOS Preview: 15-20 min
- iOS Production: 18-25 min

**Artifact Download (build-artifacts.yml):**
- Download: 30-60s
- Upload: 30-90s

**Gesamt:**
- Standard Build: 5-10 min
- Artifact Build: 25-65 min

## Skalierung

### Concurrent Builds

**GitHub Actions:**
- Parallele Jobs pro Workflow: Unbegrenzt (abhängig von Plan)
- Concurrent Workflows: Abhängig von Plan

**EAS Build:**
- Free Plan: 30 Builds/Monat
- Production Plan: Unbegrenzt mit Fair Use

### Optimierungen für Scale

1. **Matrix-Parallelisierung**
2. **Dependency Caching**
3. **Selective Builds** (nur geänderte Platforms)
4. **Build-Profile Optimierung**

## Erweiterungen

### Mögliche Zusatz-Features

1. **Automatische Tests:**
   ```yaml
   - name: Run Tests
     run: npm test
   ```

2. **Linting:**
   ```yaml
   - name: Lint Code
     run: npm run lint
   ```

3. **E2E Testing:**
   - Detox für React Native
   - Maestro für UI-Tests

4. **Notifications:**
   - Slack-Integration
   - Email-Benachrichtigungen
   - Discord Webhooks

5. **Advanced Deployments:**
   - Staged Rollouts
   - A/B Testing Builds
   - Multiple Distribution Channels

## Zusammenfassung

Die CI/CD-Pipeline bietet:

✅ **Automatisierung:** Builds bei jedem Push
✅ **Flexibilität:** Manuelle und automatische Triggers
✅ **Sicherheit:** Secrets Management, Build Isolation
✅ **Transparenz:** Logs, Artifacts, Build History
✅ **Skalierbarkeit:** Parallele Builds, Caching
✅ **Distribution:** Multiple Deployment-Kanäle

**Next Steps:**
1. Setup GitHub Secrets
2. Test ersten Build
3. Configure Signing
4. Deploy to Stores
