# Pimcore Voyager

**Pimcore Voyager** ist eine generische Mobile Companion App (React Native, Expo) für Pimcore – das Enterprise Open Source Daten- und Experience Management System.

## 🎯 Ziel

Die App ermöglicht den schnellen und einfachen Zugriff auf beliebige Pimcore Datenobjekte über mobile Endgeräte (iOS/Android). Sie dient als „Außenposten" für das Bearbeiten, Durchsuchen und Verwalten strukturierter Pimcore-Daten, auch offline.

## ✨ Hauptfunktionen

- **Dynamische Datenobjektverwaltung:** Automatisches Auslesen der Pimcore Class Definitions, Listen- und Detail-Ansichten für beliebige Objektklassen.
- **Suche & Filter:** Übergreifende Objektsuche und Filteroptionen nach Objektklassen und Feldern.
- **Bearbeitung & Validierung:** Bearbeiten von Datenobjekten, Validierung nach den Vorgaben der Pimcore Class Definitions.
- **Offline-Unterstützung:** Daten können mobil bearbeitet und werden bei erneuter Verbindung synchronisiert.
- **Sichere Authentifizierung:** Integration moderner Authentifizierungsmethoden (OAuth2, JWT).
- **Plattformübergreifend:** Entwicklung mit React Native, basiert auf Expo.
- **70+ Data Object Types:** Unterstützung für alle Pimcore Data Object Typen (in Entwicklung).

## 👥 Für wen?

- Pimcore-Redakteure, Außendienst, Content Teams & Admins, die unterwegs Datenobjekte pflegen oder abrufen wollen.

## 🏗️ Wie funktioniert es?

Die App kommuniziert mit den Pimcore REST / GraphQL APIs und generiert Interfaces dynamisch anhand der im Backend gepflegten Datenklassen. Struktur, Felder und Validierungen werden somit automatisch übernommen, bei Änderungen im Backend sind keine App-Updates nötig.

## 🚀 Quick Start

\`\`\`bash
# Repository klonen
git clone https://github.com/dpfaffenbauer/PimcoreVoyager.git
cd PimcoreVoyager

# Dependencies installieren
npm install

# Development Server starten
npm start

# Auf iOS starten (benötigt Xcode)
npm run ios

# Auf Android starten (benötigt Android Studio)
npm run android
\`\`\`

## 📋 Voraussetzungen

- Node.js (v18 oder höher)
- npm oder yarn
- Expo CLI
- Für iOS: Xcode (nur macOS)
- Für Android: Android Studio

## 📚 Dokumentation

- [CONTRIBUTING.md](CONTRIBUTING.md) - Entwicklungs-Leitfaden
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Architektur-Übersicht
- [docs/DATA_TYPE_IMPLEMENTATION.md](docs/DATA_TYPE_IMPLEMENTATION.md) - Data Type Implementation Guide
- [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md) - Projektstruktur
- [docs/ROADMAP.md](docs/ROADMAP.md) - Entwicklungs-Roadmap

## 🎯 Status & Roadmap

**Current Status**: Phase 1 - Foundation ✅

Das Projekt befindet sich in der initialen Entwicklungsphase. Die Grundstruktur ist aufgesetzt, und die Implementierung der Data Object Types beginnt in Kürze.

Siehe [ROADMAP.md](docs/ROADMAP.md) für detaillierte Phasenplanung.

### Implementierte Features
- ✅ Projekt Setup & Konfiguration
- ✅ Basis-Dokumentation
- ✅ Projektstruktur

### In Entwicklung
- 🔄 Core Architecture (Type Registry, Base Components)
- ⏳ Authentication System
- ⏳ Pimcore API Integration

### Geplant
- Data Object Types (70+ Typen)
- List & Detail Views
- Edit Functionality
- Offline Support
- CI/CD Pipeline

## 🏗️ Build & Release

Builds werden automatisiert per CI/CD-Workflows erstellt (Android/iOS/Expo). Releases erfolgen als OTA-Updates, via TestFlight oder direkte APK-Bereitstellung.

\`\`\`bash
# Production Build für Android
eas build --platform android --profile production

# Production Build für iOS
eas build --platform ios --profile production
\`\`\`

## 🤝 Contributing

Beiträge sind willkommen! Siehe [CONTRIBUTING.md](CONTRIBUTING.md) für Details zum Entwicklungsprozess.

### Data Type Implementation

Das Projekt benötigt Implementierungen für 70+ Pimcore Data Object Typen. Jeder Type benötigt:
- Display Component (Anzeige)
- Edit Component (Bearbeitung)
- Validator (Validierung)
- Transformer (API ↔ UI Konvertierung)

Siehe [DATA_TYPE_IMPLEMENTATION.md](docs/DATA_TYPE_IMPLEMENTATION.md) für einen detaillierten Implementierungs-Leitfaden.

## 📦 Technologie-Stack

- **Frontend**: React Native, Expo, TypeScript
- **Navigation**: React Navigation
- **State Management**: Zustand/Redux, React Query
- **API**: Pimcore REST/GraphQL
- **Authentication**: OAuth2/JWT
- **Storage**: Expo SecureStore, AsyncStorage
- **Testing**: Jest, React Native Testing Library

## 📄 Lizenz

GPL-3.0 - Siehe [LICENSE](LICENSE) für Details.

## 🔗 Links

- [Pimcore](https://pimcore.com/)
- [Pimcore Studio UI Bundle](https://github.com/pimcore/studio-ui-bundle) (Referenz-Implementierung)
- [React Native](https://reactnative.dev/)
- [Expo](https://expo.dev/)

## 📧 Kontakt

Bei Fragen oder Anregungen erstelle bitte ein [Issue](https://github.com/dpfaffenbauer/PimcoreVoyager/issues) oder kontaktiere @dpfaffenbauer.

---

> **Note**: Dies ist ein aktives Entwicklungsprojekt. Die App befindet sich in einem frühen Stadium. Contributions und Feedback sind sehr willkommen!
