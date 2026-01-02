# Schnellstart: GitHub Secrets konfigurieren

Diese Anleitung hilft dir, alle erforderlichen GitHub Secrets für die CI/CD-Pipeline einzurichten.

## GitHub Secrets hinzufügen

Navigiere zu deinem Repository:
```
Settings → Secrets and variables → Actions → New repository secret
```

## Erforderliche Secrets

### 1. EXPO_TOKEN (Pflicht)

**Was ist das?**
Der Access Token für Expo Application Services (EAS).

**Wie bekomme ich den Token?**
1. Gehe zu [expo.dev](https://expo.dev) und melde dich an
2. Navigiere zu [expo.dev/accounts/[username]/settings/access-tokens](https://expo.dev/accounts)
3. Klicke auf "Create Token"
4. Name: `GitHub Actions`
5. Kopiere den generierten Token

**GitHub Secret erstellen:**
- Name: `EXPO_TOKEN`
- Value: `[dein-expo-token]`

---

## Optionale Secrets (für erweiterte Features)

### 2. EXPO_APPLE_ID (Optional - für TestFlight)

**Was ist das?**
Deine Apple ID für TestFlight Upload.

**GitHub Secret erstellen:**
- Name: `EXPO_APPLE_ID`
- Value: `deine-email@example.com`

### 3. EXPO_APPLE_APP_SPECIFIC_PASSWORD (Optional - für TestFlight)

**Was ist das?**
Ein App-spezifisches Passwort für deinen Apple Account.

**Wie generiere ich das?**
1. Gehe zu [appleid.apple.com](https://appleid.apple.com)
2. Anmelden
3. Im Bereich "Sicherheit" → "App-spezifische Passwörter"
4. Klicke auf "+" zum Generieren
5. Label: `EAS Build`
6. Kopiere das generierte Passwort (Format: xxxx-xxxx-xxxx-xxxx)

**GitHub Secret erstellen:**
- Name: `EXPO_APPLE_APP_SPECIFIC_PASSWORD`
- Value: `xxxx-xxxx-xxxx-xxxx`

---

## Repository Variables (Optional)

### ENABLE_TESTFLIGHT_DEPLOY

Um automatisches TestFlight-Deployment zu aktivieren:

```
Settings → Secrets and variables → Actions → Variables → New repository variable
```

- Name: `ENABLE_TESTFLIGHT_DEPLOY`
- Value: `true`

---

## Validierung

Nach dem Einrichten der Secrets:

1. Gehe zu `Actions` Tab in deinem Repository
2. Wähle "Build and Deploy" Workflow
3. Klicke auf "Run workflow"
4. Wähle Platform: `android`
5. Wähle Profile: `preview`
6. Klicke auf "Run workflow"

Wenn der Workflow erfolgreich startet, sind deine Secrets korrekt konfiguriert! 🎉

---

## Zusammenfassung

**Minimum-Konfiguration (nur Android/iOS Builds):**
- ✅ `EXPO_TOKEN`

**Vollständige Konfiguration (mit TestFlight):**
- ✅ `EXPO_TOKEN`
- ✅ `EXPO_APPLE_ID`
- ✅ `EXPO_APPLE_APP_SPECIFIC_PASSWORD`
- ✅ `ENABLE_TESTFLIGHT_DEPLOY` (Variable)

---

## Nächste Schritte

Nach der Secret-Konfiguration:

1. ✅ Lies [CI-CD-SETUP.md](./CI-CD-SETUP.md) für vollständige Dokumentation
2. ✅ Konfiguriere Android/iOS Signierung mit `eas credentials`
3. ✅ Teste den ersten Build mit GitHub Actions
4. ✅ Richte TestFlight/Play Store Deployment ein (optional)

---

## Probleme?

Siehe [Troubleshooting](./CI-CD-SETUP.md#troubleshooting) Sektion in der Hauptdokumentation.
