# Dokumentation: CI/CD Build Pipeline

Diese Dokumentation beschreibt die vollständige CI/CD-Pipeline für Pimcore Voyager.

## 📚 Dokumentationsübersicht

### Für Einsteiger

1. **[SECRETS-SETUP.md](./SECRETS-SETUP.md)** - ⭐ **START HIER**
   - Schnellstart-Anleitung für GitHub Secrets
   - Schritt-für-Schritt Konfiguration
   - Minimale Einrichtung in 10 Minuten

### Vollständige Dokumentation

2. **[CI-CD-SETUP.md](./CI-CD-SETUP.md)** - 📖 **Hauptdokumentation**
   - Vollständige Pipeline-Einrichtung
   - EAS-Konfiguration
   - Workflow-Erklärungen
   - Troubleshooting-Guide

3. **[BUILD-PROCESS.md](./BUILD-PROCESS.md)** - 🔧 **Build-Details**
   - Build-Architektur
   - Build-Profile (development, preview, production)
   - EAS-Commands
   - Performance-Optimierung

4. **[SIGNING.md](./SIGNING.md)** - 🔐 **Signierung & Zertifikate**
   - Android Keystore-Setup
   - iOS Certificate/Provisioning
   - Credential-Management
   - Store-Konfiguration

## 🚀 Quickstart

### 1. GitHub Secrets einrichten (5 Min)

```bash
# 1. Erstelle Expo Account bei expo.dev
# 2. Generiere Access Token
# 3. Füge als GitHub Secret hinzu: EXPO_TOKEN
```

→ Detaillierte Anleitung: [SECRETS-SETUP.md](./SECRETS-SETUP.md)

### 2. App mit EAS initialisieren (5 Min)

```bash
npm install -g eas-cli
eas login
eas init
```

### 3. Ersten Build starten

**Via GitHub Actions:**
1. Gehe zu `Actions` Tab
2. Wähle "Build and Deploy"
3. Klicke "Run workflow"
4. Platform: `android`, Profile: `preview`
5. Starte Workflow

**Via CLI:**
```bash
eas build --platform android --profile preview
```

## 📋 Checkliste: Vollständige Einrichtung

### Basis-Setup (erforderlich)

- [ ] Expo Account erstellt
- [ ] EAS CLI installiert (`npm install -g eas-cli`)
- [ ] Projekt mit EAS initialisiert (`eas init`)
- [ ] `EXPO_TOKEN` als GitHub Secret hinzugefügt
- [ ] Erster Test-Build erfolgreich

### Android-Signierung

- [ ] Keystore generiert oder EAS Managed gewählt
- [ ] Keystore in EAS hochgeladen (`eas credentials`)
- [ ] Play Console App erstellt (optional)
- [ ] Google Play Service Account konfiguriert (optional)

### iOS-Signierung

- [ ] Apple Developer Account vorhanden
- [ ] Bundle ID registriert (`com.pimcore.voyager`)
- [ ] Distribution Certificate erstellt
- [ ] Provisioning Profile erstellt
- [ ] Certificates in EAS hochgeladen
- [ ] App in App Store Connect erstellt

### TestFlight (Optional)

- [ ] `EXPO_APPLE_ID` Secret hinzugefügt
- [ ] `EXPO_APPLE_APP_SPECIFIC_PASSWORD` Secret hinzugefügt
- [ ] `ENABLE_TESTFLIGHT_DEPLOY` Variable gesetzt
- [ ] TestFlight-Upload getestet

## 🔄 Workflows Übersicht

### `build.yml` - Standard Build

**Trigger:**
- Push auf `main`/`develop`
- Pull Requests
- Manuell

**Dauer:** ~5-10 Minuten (ohne Warten auf EAS)

**Output:** Build-Link zum EAS Dashboard

### `build-artifacts.yml` - Build mit Downloads

**Trigger:**
- Manuell
- GitHub Release

**Dauer:** ~20-60 Minuten (wartet auf Build)

**Output:** APK/IPA als GitHub Artifacts

## 🎯 Typische Workflows

### Entwicklung

```bash
# Lokaler Development Build
eas build --platform android --profile development --local
```

### Testing

```bash
# CI Build via GitHub Actions
# → Actions → "Build and Deploy" → Run workflow
# Platform: all, Profile: preview
```

### Release

```bash
# 1. Tag erstellen
git tag v1.0.0
git push origin v1.0.0

# 2. GitHub Release erstellen
# → Triggers build-artifacts.yml automatisch

# 3. APK/IPA von Release herunterladen
```

## 🛠️ Häufige Aufgaben

### Build-Status prüfen

```bash
# Via EAS Dashboard
https://expo.dev/accounts/[username]/projects/pimcore-voyager/builds

# Via CLI
eas build:list
```

### Credentials verwalten

```bash
# Android
eas credentials --platform android

# iOS
eas credentials --platform ios
```

### Build herunterladen

```bash
# Via CLI
eas build:view [BUILD_ID]

# Via Dashboard
https://expo.dev → Project → Builds → Download
```

## 📖 Weiterführende Dokumentation

### Externe Ressourcen

- [Expo Documentation](https://docs.expo.dev/)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Submit Docs](https://docs.expo.dev/submit/introduction/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

### Pimcore Voyager

- [README.md](../README.md) - Projekt-Übersicht
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Entwicklungs-Guide

## 🆘 Support

### Probleme mit Builds?

1. ✅ Prüfe [Troubleshooting](./CI-CD-SETUP.md#troubleshooting)
2. ✅ Schaue in [Build Logs](#build-status-prüfen)
3. ✅ Suche in [Expo Forums](https://forums.expo.dev/)
4. ✅ Erstelle Issue in diesem Repo

### Fragen?

- GitHub Issues: [PimcoreVoyager Issues](https://github.com/dpfaffenbauer/PimcoreVoyager/issues)
- Expo Community: [Expo Forums](https://forums.expo.dev/)
- Expo Discord: [discord.gg/expo](https://discord.gg/expo)

## 📝 Changelog

### 2025-12-27 - Initial Setup
- ✅ Basis-Workflows erstellt
- ✅ EAS-Integration
- ✅ Android/iOS Build-Support
- ✅ Artifact-Upload
- ✅ TestFlight-Integration (optional)
- ✅ Vollständige Dokumentation

---

**Nächste Schritte:** Starte mit [SECRETS-SETUP.md](./SECRETS-SETUP.md) 🚀
