# Pimcore Voyager

**Pimcore Voyager** ist eine generische Mobile Companion App (React Native, Expo) für Pimcore – das Enterprise Open Source Daten- und Experience Management System.

## Ziel

Die App ermöglicht den schnellen und einfachen Zugriff auf beliebige Pimcore Datenobjekte über mobile Endgeräte (iOS/Android). Sie dient als „Außenposten“ für das Bearbeiten, Durchsuchen und Verwalten strukturierter Pimcore-Daten, auch offline.

## Hauptfunktionen

- **Dynamische Datenobjektverwaltung:** Automat. Auslesen der Pimcore Class Definitions, Listen- und Detail-Ansichten für beliebige Objektklassen.
- **Suche & Filter:** Übergreifende Objektsuche und Filteroptionen nach Objektklassen und Feldern.
- **Bearbeitung & Validierung:** Bearbeiten von Datenobjekten, Validierung nach den Vorgaben der Pimcore Class Definitions.
- **Offline-Unterstützung:** Daten können mobil bearbeitet und werden bei erneuter Verbindung synchronisiert.
- **Sichere Authentifizierung:** Integration moderner Authentifizierungsmethoden (OAuth2, JWT).
- **Plattformübergreifend:** Entwicklung mit React Native, basiert auf Expo.

## Für wen?

- Pimcore-Redakteure, Außendienst, Content Teams & Admins, die unterwegs Datenobjekte pflegen oder abrufen wollen.

## Wie funktioniert es?

Die App kommuniziert mit den Pimcore REST / GraphQL APIs und generiert Interfaces dynamisch anhand der im Backend gepflegten Datenklassen. Struktur, Felder und Validierungen werden somit automatisch übernommen, bei Änderungen im Backend sind keine App-Updates nötig.

## Build & Release

Builds werden automatisiert per CI/CD-Workflows erstellt (Android/iOS/Expo). Releases erfolgen als OTA-Updates, via TestFlight oder direkte APK-Bereitstellung.

### 🚀 CI/CD Pipeline

Die App nutzt **GitHub Actions** und **Expo Application Services (EAS)** für automatisierte Builds:

- ✅ **Automatische Builds** bei Push/Merge auf `main`/`develop`
- ✅ **Android APK** und **iOS IPA** Builds
- ✅ **Artifact-Upload** zu GitHub Actions
- ✅ **TestFlight Deployment** (optional)
- ✅ **GitHub Release Integration**

**Schnellstart:** [docs/SECRETS-SETUP.md](docs/SECRETS-SETUP.md)

**Vollständige Dokumentation:** [docs/CI-CD-SETUP.md](docs/CI-CD-SETUP.md)

### Manuelle Builds

```bash
# Lokale Entwicklung
npm start

# EAS Build erstellen
eas build --platform android --profile preview
eas build --platform ios --profile preview
```

## Dokumentation

- 📖 **[CI/CD Setup](docs/CI-CD-SETUP.md)** - Vollständige Pipeline-Dokumentation
- 🔐 **[Signierung](docs/SIGNING.md)** - Android/iOS Zertifikate & Keys
- 🔧 **[Build-Prozess](docs/BUILD-PROCESS.md)** - Technische Build-Details
- 🚀 **[Secrets Setup](docs/SECRETS-SETUP.md)** - GitHub Secrets Quickstart

## Entwicklung

Für Details zu Installation und Entwicklung siehe [CONTRIBUTING.md](CONTRIBUTING.md) und die jeweiligen [User Stories](https://github.com/dpfaffenbauer/PimcoreVoyager/issues).
