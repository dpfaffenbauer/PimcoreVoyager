# Pimcore Voyager

<p align="center">
  <img src="assets/logo.png" alt="Pimcore Voyager Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Mobile Companion App für Pimcore</strong><br>
  Verwalte Datenobjekte, Assets und Dokumente unterwegs
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#verwendung">Verwendung</a> •
  <a href="#entwicklung">Entwicklung</a> •
  <a href="#lizenz">Lizenz</a>
</p>

---

## Überblick

**Pimcore Voyager** ist eine native Mobile App (React Native/Expo), die sich über die Studio API mit deiner Pimcore-Instanz verbindet. Durchsuche, betrachte und verwalte deine Pimcore-Inhalte direkt von deinem iOS- oder Android-Gerät.

## Features

### Datenobjekte
- Baumstruktur der Datenobjekte durchsuchen
- Objektdetails mit vollständigem Feldrendering
- Unterstützung aller Pimcore-Feldtypen (Input, Textarea, Select, Relations, etc.)
- Field Collections und Object Bricks Support
- Grid-Ansicht für Objekte in Ordnern

### Assets
- Asset-Baum und Ordner durchsuchen
- Asset-Details und Metadaten anzeigen
- Bildvorschau
- Dateityp-Icons

### Dokumente
- Dokument-Baum durchsuchen
- Dokumentdetails anzeigen
- Page, Snippet und Link Support

### Workflows
- Workflow-Status auf Objekten anzeigen
- Workflow-Transitionen ausführen
- Globale Workflow-Aktionen triggern

### Multi-Instanz Support
- Verbindung zu mehreren Pimcore-Instanzen
- Einfaches Wechseln zwischen Instanzen
- Sichere Speicherung der Zugangsdaten

### Suche
- Globale Suche über alle Content-Typen
- Filter nach Datenobjekten, Assets oder Dokumenten

## Installation

### Aus dem App Store (Kostenlos)

Die offizielle Pimcore Voyager App ist kostenlos verfügbar:

- **iOS**: [App Store](#) *(coming soon)*
- **Android**: [Google Play](#) *(coming soon)*

### Voraussetzungen

- Pimcore 11.x oder höher
- Pimcore Studio UI Bundle installiert und aktiviert
- Gültige Pimcore-Benutzerdaten

## Verwendung

### Erste Schritte

1. **App starten** und auf "Instanz hinzufügen" tippen
2. **Pimcore-Details eingeben:**
   - Instanzname (z.B. "Produktion")
   - API URL: `https://deine-pimcore.com/pimcore-studio/api`
3. **Anmelden** mit deinen Pimcore-Zugangsdaten
4. **Durchsuchen** deiner Inhalte!

### Navigation

- **Datenobjekte**: Datenobjekte nach Klasse organisiert durchsuchen
- **Assets**: Medienbibliothek und Dateien zugreifen
- **Dokumente**: Pimcore-Dokumente anzeigen
- **Suche**: Inhalte über alle Typen finden
- **Einstellungen**: Instanzen und App-Einstellungen verwalten

## Architektur

### Tech Stack

| Technologie | Verwendung |
|-------------|------------|
| React Native | Mobile App Framework |
| Expo | Build & Development Toolchain |
| TypeScript | Typsicherheit |
| React Navigation | Navigation |
| React Native Paper | UI Components (Material Design) |
| Zustand | State Management |
| Axios | HTTP Client |

### Projektstruktur

```
src/
├── apis/                    # API Services
│   ├── apiClient.ts         # Axios Client Konfiguration
│   ├── authService.ts       # Authentifizierung
│   ├── pimcoreService.ts    # Haupt-Service (Facade)
│   ├── dataObjectService.ts # Datenobjekt-Operationen
│   ├── assetService.ts      # Asset-Operationen
│   ├── documentService.ts   # Dokument-Operationen
│   ├── classService.ts      # Klassendefinitionen
│   ├── workflowService.ts   # Workflow-Operationen
│   └── searchService.ts     # Such-Funktionalität
├── components/              # Wiederverwendbare UI-Komponenten
│   ├── FieldRenderer.tsx    # Dynamisches Feldrendering
│   ├── WorkflowSection.tsx  # Workflow-Status Anzeige
│   ├── CustomDrawer.tsx     # Navigation Drawer
│   └── FloatingActionMenu.tsx
├── screens/                 # Screen-Komponenten
│   ├── LoginScreen.tsx
│   ├── InstanceSelectionScreen.tsx
│   ├── DataObjectsScreen.tsx
│   ├── ObjectDetailScreen.tsx
│   ├── ObjectListScreen.tsx
│   ├── AssetsScreen.tsx
│   ├── AssetDetailScreen.tsx
│   ├── DocumentsScreen.tsx
│   ├── DocumentDetailScreen.tsx
│   ├── FolderDetailScreen.tsx
│   └── SearchScreen.tsx
├── navigation/              # Navigation Konfiguration
│   └── AppNavigation.tsx
├── store/                   # State Management
│   ├── authStore.ts
│   └── instanceStore.ts
├── types/                   # TypeScript Definitionen
│   ├── pimcore.ts
│   └── auth.ts
└── config/                  # Konfiguration
    └── env.ts
```

### API Services

Die App kommuniziert mit Pimcore über die Studio API. Services sind nach Domäne organisiert:

| Service | Beschreibung |
|---------|--------------|
| `DataObjectService` | CRUD-Operationen für Datenobjekte |
| `AssetService` | Asset-Baum und Datei-Operationen |
| `DocumentService` | Dokument-Baum und Details |
| `ClassService` | Klassendefinitionen und Layouts |
| `WorkflowService` | Workflow-Status und Aktionen |
| `SearchService` | Globale Such-Funktionalität |

Alle Services werden über `PimcoreService` für Rückwärtskompatibilität re-exportiert.

## Entwicklung

Für detaillierte Entwicklungsanleitungen siehe [DEVELOPMENT.md](DEVELOPMENT.md).

### Quick Start

```bash
# Repository klonen
git clone https://github.com/cors-gmbh/pimcore-voyager.git
cd pimcore-voyager

# Dependencies installieren
npm install

# Development Server starten
npm start

# Auf iOS ausführen
npm run ios

# Auf Android ausführen
npm run android
```

### Building

```bash
# Development Build (mit Dev Client)
npx expo run:ios --device

# Release Build
npx expo run:ios --device --configuration Release

# EAS Cloud Build
eas build --profile production --platform ios
```

### TestFlight / App Store

```bash
# Archive erstellen und zu App Store Connect hochladen
# 1. Xcode öffnen
open ios/PimcoreVoyager.xcworkspace

# 2. In Xcode: Product → Archive → Distribute App
```

## Contributing

Contributions sind willkommen! Bitte lies die Contributing Guidelines bevor du einen Pull Request erstellst.

1. Repository forken
2. Feature Branch erstellen (`git checkout -b feature/amazing-feature`)
3. Änderungen committen (`git commit -m 'Add amazing feature'`)
4. Branch pushen (`git push origin feature/amazing-feature`)
5. Pull Request öffnen

Mit deinem Beitrag stimmst du den Bedingungen unserer Lizenzvereinbarung zu.

## Support

- **Dokumentation**: [docs.pimcore.com](https://docs.pimcore.com)
- **Issues**: [GitHub Issues](https://github.com/cors-gmbh/pimcore-voyager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/cors-gmbh/pimcore-voyager/discussions)

## Lizenz

**Pimcore Voyager License (PVL)**

| Nutzung | Lizenz |
|---------|--------|
| Offizielle App aus App Store / Google Play | **Kostenlos** |
| Geforkte oder angepasste Versionen | **Kostenpflichtig** via [store.pimcore.com](https://store.pimcore.com) |

Siehe [LICENSE.md](LICENSE.md) für vollständige Lizenzbedingungen.

---

<p align="center">
  <strong>Entwickelt von</strong><br>
  <a href="https://www.cors.gmbh">CORS GmbH</a><br>
  Zeileisstraße 6, 4600 Wels, Austria
</p>

<p align="center">
  © 2025 CORS GmbH. Alle Rechte vorbehalten.
</p>
