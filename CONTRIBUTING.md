# Contributing to Pimcore Voyager

Willkommen! Wir freuen uns über Beiträge zu Pimcore Voyager.

## Entwicklungsumgebung einrichten

### Voraussetzungen

- Node.js 18+ ([nodejs.org](https://nodejs.org))
- npm oder yarn
- Expo CLI (`npm install -g expo-cli`)
- EAS CLI (`npm install -g eas-cli`)
- Git

### Optional für native Entwicklung

- **Android:** Android Studio + Android SDK
- **iOS:** macOS mit Xcode (nur auf Mac)

### Repository klonen

```bash
git clone https://github.com/dpfaffenbauer/PimcoreVoyager.git
cd PimcoreVoyager
```

### Dependencies installieren

```bash
npm install
```

### App starten

```bash
# Development Server starten
npm start

# Oder direkt auf Plattform
npm run android  # Android Emulator/Gerät
npm run ios      # iOS Simulator (nur macOS)
npm run web      # Web Browser
```

## Entwicklungs-Workflow

### 1. Branch erstellen

```bash
git checkout -b feature/meine-neue-funktion
```

### Branch-Naming-Konventionen

- `feature/` - Neue Features
- `bugfix/` - Bugfixes
- `docs/` - Dokumentations-Änderungen
- `refactor/` - Code-Refactoring
- `test/` - Test-Änderungen

### 2. Änderungen entwickeln

```bash
# Live-Reload nutzen
npm start

# Expo Go App auf Smartphone installieren
# QR-Code scannen für Live-Testing
```

### 3. Code-Qualität prüfen

```bash
# Linting (falls konfiguriert)
npm run lint

# Tests ausführen (falls vorhanden)
npm test
```

### 4. Commits erstellen

Verwende aussagekräftige Commit-Messages:

```bash
git add .
git commit -m "feat: Add data object list view"
git commit -m "fix: Resolve authentication timeout issue"
git commit -m "docs: Update build documentation"
```

**Commit-Message-Format:**

```
<type>: <subject>

<body> (optional)

<footer> (optional)
```

**Types:**
- `feat`: Neues Feature
- `fix`: Bugfix
- `docs`: Dokumentation
- `style`: Code-Formatierung
- `refactor`: Code-Refactoring
- `test`: Tests hinzufügen/ändern
- `chore`: Build/Tool-Konfiguration

### 5. Pull Request erstellen

```bash
git push origin feature/meine-neue-funktion
```

Erstelle PR auf GitHub mit:
- Klarer Beschreibung der Änderungen
- Screenshots (bei UI-Änderungen)
- Testing-Hinweise
- Referenz zu Issues (z.B. "Closes #123")

## Testing

### Auf echten Geräten testen

**Android:**
```bash
# Development Build erstellen
eas build --platform android --profile development

# Installieren und testen
```

**iOS:**
```bash
# Development Build erstellen (benötigt registriertes Gerät)
eas build --platform android --profile development

# Via TestFlight oder direkt installieren
```

### Testing-Richtlinien

- ✅ Teste auf Android und iOS
- ✅ Teste verschiedene Bildschirmgrößen
- ✅ Teste Offline-Funktionalität
- ✅ Teste mit echten Pimcore-Daten
- ✅ Teste Edge-Cases

## Code-Style

### JavaScript/React Native

- ESLint-Konfiguration befolgen
- Funktionale Komponenten mit Hooks bevorzugen
- PropTypes oder TypeScript für Type-Checking
- Aussagekräftige Variablen- und Funktionsnamen

### Beispiel

```javascript
// Gut
const fetchDataObjects = async (classId) => {
  try {
    const response = await api.getObjects(classId);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch objects:', error);
    throw error;
  }
};

// Vermeiden
const fd = async (c) => {
  const r = await api.getObjects(c);
  return r.data;
};
```

## Dokumentation

### Code-Kommentare

```javascript
/**
 * Synchronisiert lokale Datenobjekte mit Pimcore Backend
 * 
 * @param {Array} objects - Array von zu synchronisierenden Objekten
 * @param {Object} options - Sync-Optionen
 * @param {boolean} options.forceUpdate - Erzwingt Update aller Objekte
 * @returns {Promise<Object>} Sync-Ergebnis mit Statistiken
 */
const syncObjects = async (objects, options = {}) => {
  // Implementation...
};
```

### README/Docs aktualisieren

Bei Features, die Dokumentation benötigen:
- Update README.md
- Ergänze docs/ falls nötig
- Füge Beispiele hinzu

## CI/CD und Builds

### Lokale Builds testen

```bash
# Preview Build (empfohlen für Testing)
eas build --platform android --profile preview

# Production Build
eas build --platform android --profile production
```

### CI/CD Workflows

Pull Requests triggern automatisch:
- Build-Checks (via GitHub Actions)
- EAS Build-Submission

Stelle sicher, dass:
- ✅ CI-Workflows erfolgreich durchlaufen
- ✅ Keine Build-Fehler auftreten
- ✅ App nach Build funktioniert

## Release-Prozess

### Version erhöhen

1. Update `package.json`:
```json
{
  "version": "1.1.0"
}
```

2. Update `app.json`:
```json
{
  "expo": {
    "version": "1.1.0",
    "ios": {
      "buildNumber": "1.1.0"
    },
    "android": {
      "versionCode": 2
    }
  }
}
```

**Version-Schema:** `MAJOR.MINOR.PATCH`
- **MAJOR:** Breaking Changes
- **MINOR:** Neue Features (backwards compatible)
- **PATCH:** Bugfixes

**Android versionCode:**
- Muss bei jedem Release erhöht werden
- Integer-Wert
- Beispiel: 1, 2, 3, 4...

### Release erstellen

```bash
# Tag erstellen
git tag v1.1.0
git push origin v1.1.0

# GitHub Release erstellen
# Löst automatisch build-artifacts.yml Workflow aus
```

## Pimcore-Integration

### API-Kommunikation

Die App kommuniziert mit Pimcore über:
- REST API (Datenabruf)
- GraphQL API (komplexe Queries)

### Testing mit Pimcore Backend

Setup eines Test-Pimcore-Backends:

```bash
# Pimcore-Testinstanz aufsetzen
# API-Credentials konfigurieren
# .env.local erstellen:
PIMCORE_API_URL=https://your-pimcore-instance.com/api
PIMCORE_API_KEY=your-api-key
```

## Hilfe und Support

### Fragen?

- GitHub Discussions: Allgemeine Fragen
- GitHub Issues: Bugs und Feature-Requests
- Expo Forums: Expo-spezifische Fragen

### Probleme mit Setup?

1. Prüfe [docs/CI-CD-SETUP.md](docs/CI-CD-SETUP.md)
2. Schaue in bestehende Issues
3. Erstelle neues Issue mit Details:
   - Umgebung (OS, Node-Version, etc.)
   - Fehlermeldung
   - Schritte zur Reproduktion

## Code of Conduct

Wir folgen dem [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/).

**Zusammenfassung:**
- Respektvoll und konstruktiv kommunizieren
- Unterschiedliche Perspektiven akzeptieren
- Fokus auf das Projekt
- Keine Belästigung oder Diskriminierung

## Lizenz

Durch Beiträge stimmst du zu, dass deine Änderungen unter der MIT-Lizenz lizenziert werden.

## Danke!

Danke für deine Beiträge zu Pimcore Voyager! 🚀

Jeder Beitrag, ob groß oder klein, hilft das Projekt zu verbessern.
