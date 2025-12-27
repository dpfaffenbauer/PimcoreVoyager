# Pimcore Voyager

**Pimcore Voyager** ist eine generische Mobile Companion App (React Native, Expo) für Pimcore – das Enterprise Open Source Daten- und Experience Management System.

## Ziel

Die App ermöglicht den schnellen und einfachen Zugriff auf beliebige Pimcore Datenobjekte über mobile Endgeräte (iOS/Android). Sie dient als „Außenposten“ für das Bearbeiten, Durchsuchen und Verwalten strukturierter Pimcore-Daten, auch offline.

## Hauptfunktionen

- **Dynamische Datenobjektverwaltung:** Automat. Auslesen der Pimcore Class Definitions, Listen- und Detail-Ansichten für beliebige Objektklassen.
- **Suche & Filter:** Übergreifende Objektsuche und Filteroptionen nach Objektklassen und Feldern.
- **Bearbeitung & Validierung:** Bearbeiten von Datenobjekten, Validierung nach den Vorgaben der Pimcore Class Definitions.
- **Offline-Unterstützung:** Daten können mobil bearbeitet und werden bei erneuter Verbindung synchronisiert.
- **Sichere Authentifizierung:** Integration der Pimcore Studio API Authentifizierung.
- **Plattformübergreifend:** Entwicklung mit React Native, basiert auf Expo.

## Für wen?

- Pimcore-Redakteure, Außendienst, Content Teams & Admins, die unterwegs Datenobjekte pflegen oder abrufen wollen.

## Wie funktioniert es?

Die App kommuniziert mit der **Pimcore Studio API** und generiert Interfaces dynamisch anhand der im Backend gepflegten Datenklassen. Struktur, Felder und Validierungen werden somit automatisch übernommen, bei Änderungen im Backend sind keine App-Updates nötig.

### Technische Details

- **API-Integration**: Nutzt die native Pimcore Studio API (`/studio/api`)
- **Authentifizierung**: Verwendet die eingebaute Pimcore-Authentifizierung
- **Datenmodell**: Kompatibel mit Pimcore Studio API Datenstrukturen
- **SDK-Kompatibilität**: Implementierung folgt denselben Patterns wie `@pimcore/studio-ui-bundle` (für React Native adaptiert)

## Build & Release

Builds werden automatisiert per CI/CD-Workflows erstellt (Android/iOS/Expo). Releases erfolgen als OTA-Updates, via TestFlight oder direkte APK bereitstellung.

---

> Für Details zu Installation und Entwicklung siehe [CONTRIBUTING.md](CONTRIBUTING.md) und die jeweiligen [User Stories](https://github.com/dpfaffenbauer/PimcoreVoyager/issues).

---

## Lizenz

MIT