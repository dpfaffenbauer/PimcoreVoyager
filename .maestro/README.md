# Maestro E2E Tests

Automatisierte End-to-End Tests für PimcoreVoyager mit [Maestro](https://maestro.mobile.dev/).

## Installation

### 1. Maestro CLI installieren

```bash
# macOS / Linux
curl -Ls "https://get.maestro.mobile.dev" | bash

# Nach Installation Terminal neu starten oder:
export PATH="$PATH":"$HOME/.maestro/bin"

# Verify installation
maestro --version
```

### 2. iOS Simulator oder Android Emulator starten

```bash
# iOS Simulator starten (Xcode muss installiert sein)
open -a Simulator

# Oder Android Emulator
emulator -avd <emulator-name>
```

### 3. App bauen und installieren

```bash
# Development Build erstellen
npx expo run:ios
# oder
npx expo run:android
```

## Mock Server

Da E2E-Tests eine Pimcore-Instanz benötigen, bieten wir einen Mock-Server an, der die Pimcore Studio API simuliert.

### Mock Server starten

```bash
# In Terminal 1: Mock Server starten
npm run mock-server

# Server läuft auf http://localhost:3333
```

### Tests mit Mock Server

```bash
# In Terminal 2: Tests ausführen
npm run test:e2e:mock

# Oder manuell:
PIMCORE_URL=http://localhost:3333 maestro test .maestro/
```

### Mock Server Features
- Login/Logout mit beliebigen Credentials
- Data Objects Tree mit Beispieldaten (Cars)
- Assets Tree mit Beispielbildern
- Suchfunktion
- Health Check: `http://localhost:3333/health`

## Tests ausführen

### Alle Tests (mit Mock Server)
```bash
# 1. Mock Server starten
npm run mock-server

# 2. In neuem Terminal: Tests ausführen
npm run test:e2e:mock
```

### Mit echtem Pimcore
```bash
PIMCORE_URL="https://my-pimcore.com" \
TEST_USERNAME="user@example.com" \
TEST_PASSWORD="secret" \
npm run test:e2e
```

### Einzelnen Test
```bash
npm run test:e2e:login
# oder
maestro test .maestro/flow_login.yaml
```

### Plattform-spezifisch
```bash
npm run test:e2e:ios
npm run test:e2e:android
```

### Mit Umgebungsvariablen
```bash
PIMCORE_URL="https://my-pimcore.com" \
TEST_USERNAME="user@example.com" \
TEST_PASSWORD="secret" \
maestro test .maestro/flow_login.yaml
```

## Test aufnehmen (Record Mode)

Maestro kann User-Interaktionen aufnehmen und als Test speichern:

```bash
npm run test:e2e:record
# oder
maestro record
```

## Verfügbare Test-Flows

| Flow | Beschreibung | Tags |
|------|--------------|------|
| `flow_login.yaml` | Login-Prozess mit Instanz-Setup | auth, smoke |
| `flow_browse_data_objects.yaml` | Data Objects durchsuchen | navigation |
| `flow_edit_object.yaml` | Objekt bearbeiten | editing |
| `flow_image_gallery.yaml` | Bildergalerie anzeigen | media, gallery |
| `flow_relations.yaml` | Relationen anzeigen | relations |
| `flows/setup_and_login.yaml` | Wiederverwendbarer Setup-Flow | setup, auth |

### Flow-Struktur

Alle Flows (außer `flow_login.yaml`) nutzen den gemeinsamen Setup-Flow:

```yaml
# Run setup and login first
- runFlow: flows/setup_and_login.yaml
```

Der Setup-Flow:
1. Startet die App mit leerem State
2. Fügt die Mock Server Instanz hinzu (falls nicht vorhanden)
3. Führt den Login durch
4. Wartet auf den Hauptscreen

## Screenshots

Screenshots werden in `./test-results/` gespeichert:
- `login_success.png`
- `data_objects_tree.png`
- `gallery_before.png`
- etc.

## CI/CD Integration

### GitHub Actions

```yaml
- name: Install Maestro
  run: curl -Ls "https://get.maestro.mobile.dev" | bash

- name: Run E2E Tests
  run: |
    export PATH="$PATH":"$HOME/.maestro/bin"
    maestro test .maestro/ --format junit --output test-results/
  env:
    PIMCORE_URL: ${{ secrets.PIMCORE_URL }}
    TEST_USERNAME: ${{ secrets.TEST_USERNAME }}
    TEST_PASSWORD: ${{ secrets.TEST_PASSWORD }}
```

## Debugging

### Maestro Studio (visueller Test-Editor)
```bash
maestro studio
```

### Verbose Output
```bash
maestro test .maestro/flow_login.yaml --debug-output ./debug/
```

## Troubleshooting

### "App not found"
- Stelle sicher, dass die App installiert ist
- Prüfe die `appId` in den YAML-Dateien

### "Element not found"
- Nutze `maestro studio` um Elemente zu inspizieren
- Füge `optional: true` für optionale Elemente hinzu
- Erhöhe Timeouts mit `extendedWaitUntil`

### Screenshots zeigen falsche Sprache
- Die App nutzt deutsche Texte, Tests sind entsprechend angepasst
