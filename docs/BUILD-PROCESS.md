# Build-Prozess Dokumentation

Dieses Dokument erklärt den detaillierten Build-Prozess für Android und iOS mit EAS Build.

## Build-Architektur

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

## Build-Typen

### 1. Standard Build (`build.yml`)

**Zweck:** Schnelle Builds ohne Warten auf Completion

**Workflow:**
1. Code checkout
2. Dependencies installieren
3. EAS Build starten
4. Build-ID in Logs ausgeben
5. Workflow beenden (nicht warten)

**Verwendung:**
- Entwicklung
- CI-Checks
- Schnelle Iterationen

**Build-Download:**
Builds müssen manuell vom [EAS Dashboard](https://expo.dev) heruntergeladen werden.

### 2. Artifact Build (`build-artifacts.yml`)

**Zweck:** Vollständiger Build mit Artifact-Upload

**Workflow:**
1. Code checkout
2. Dependencies installieren
3. EAS Build starten
4. **Warten auf Build-Completion (bis 60 Min)**
5. Build-Artifact herunterladen
6. Als GitHub Artifact hochladen
7. Optional: An GitHub Release anhängen

**Verwendung:**
- Releases
- Distribution
- TestFlight/Play Store Vorbereitung

## Build-Profile im Detail

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

**Merkmale:**
- Debug-Symbole enthalten
- Schnellere Builds
- Expo Development Client aktiviert
- Nur für interne Tests

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

**Merkmale:**
- Release-Build
- Optimierter Code
- Für interne Verteilung (AdHoc iOS, APK Android)
- TestFlight-fähig

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

**Merkmale:**
- Vollständig optimiert
- Store-ready
- App Store / Play Store Deployment

## Umgebungsvariablen

### In GitHub Actions verfügbar

| Variable | Beschreibung | Beispiel |
|----------|--------------|----------|
| `EXPO_TOKEN` | Expo Access Token | `xxx-xxx-xxx` |
| `GITHUB_REF` | Git Reference | `refs/heads/main` |
| `GITHUB_SHA` | Commit SHA | `abc123...` |
| `GITHUB_RUN_ID` | Workflow Run ID | `123456` |

### In eas.json verwendbar

Umgebungsvariablen können in Build-Profilen gesetzt werden:

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

### Wichtigste Befehle

```bash
# Build starten
eas build --platform android --profile preview

# Build-Status prüfen
eas build:view [BUILD_ID]

# Build-Liste anzeigen
eas build:list

# Credentials verwalten
eas credentials

# Credentials anzeigen
eas credentials -p android
eas credentials -p ios
```

### Flags

| Flag | Beschreibung |
|------|--------------|
| `--platform` | android, ios, oder all |
| `--profile` | Build-Profil aus eas.json |
| `--non-interactive` | Keine interaktiven Prompts |
| `--no-wait` | Nicht auf Build-Completion warten |
| `--json` | JSON-Ausgabe |
| `--local` | Lokaler Build (ohne EAS Server) |

## Build-Zeiten

Typische Dauern (auf EAS Servern):

| Platform | Profile | Ungefähre Dauer |
|----------|---------|-----------------|
| Android | Development | 8-12 Min |
| Android | Preview/Production | 10-15 Min |
| iOS | Development | 12-18 Min |
| iOS | Preview/Production | 15-25 Min |

**Faktoren die Build-Zeit beeinflussen:**
- Anzahl Dependencies
- Native Modules
- Asset-Größe
- EAS Server-Last

## Debugging

### Build Logs abrufen

1. **Aus GitHub Actions:**
   - Gehe zu Actions Tab
   - Wähle Workflow Run
   - Klicke auf Job
   - Scrolle zu "Build with EAS" Step

2. **Aus EAS Dashboard:**
   - Gehe zu [expo.dev](https://expo.dev)
   - Navigiere zu deinem Projekt
   - Klicke auf "Builds"
   - Wähle Build aus
   - Volle Logs anzeigen

### Häufige Build-Fehler

#### 1. "EXPO_TOKEN not set"

**Ursache:** GitHub Secret fehlt

**Lösung:**
```bash
# Generiere Token bei expo.dev
# Füge als GitHub Secret hinzu
```

#### 2. "No valid credentials found"

**Ursache:** Signierung nicht konfiguriert

**Lösung:**
```bash
eas credentials
# Folge Anweisungen
```

#### 3. "Build timed out"

**Ursache:** Build dauert zu lange

**Lösung:**
- Nutze `build.yml` statt `build-artifacts.yml`
- Download Artifacts manuell vom EAS Dashboard

#### 4. "Provisioning profile expired" (iOS)

**Ursache:** Abgelaufenes iOS Provisioning Profile

**Lösung:**
```bash
eas credentials --platform ios
# Generiere neues Profil oder upload neues
```

## Performance-Optimierung

### 1. Dependency Caching

GitHub Actions cached automatisch `node_modules`:

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm'  # Automatisches Caching
```

### 2. Build-Profile wählen

- **Development:** Für schnelle Iterationen
- **Preview:** Für Testing
- **Production:** Nur für finale Releases

### 3. Parallele Builds

Nutze Matrix-Strategie für Android + iOS gleichzeitig:

```yaml
strategy:
  matrix:
    platform: [android, ios]
```

## Nächste Schritte

1. ✅ Verstehe Build-Prozess
2. ✅ Konfiguriere Signierung
3. ✅ Teste ersten Build
4. ✅ Automatisiere Deployment

## Weitere Ressourcen

- [EAS Build Deep Dive](https://docs.expo.dev/build/introduction/)
- [EAS Build Configuration](https://docs.expo.dev/build/eas-json/)
- [GitHub Actions Best Practices](https://docs.github.com/en/actions/learn-github-actions/best-practices-for-github-actions)
