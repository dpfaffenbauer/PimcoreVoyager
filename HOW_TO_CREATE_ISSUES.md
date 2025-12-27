# Anleitung: GitHub Issues für Pimcore Data Object Typen erstellen

## Zusammenfassung

Dieses Repository enthält Tools und Dokumentation zur Verwaltung von GitHub Issues für die Implementierung von Pimcore Data Object Typen in der Pimcore Voyager React Native App.

## Aktueller Status

- **Gesamt Datentypen:** 59
- **Mit Issues:** 6 (Issues #8, #10-#14)
- **Fehlende Issues:** 53

## Dateien

- `scripts/pimcore-data-types.json` - Liste aller Pimcore Data Object Typen
- `scripts/create-missing-issues.js` - Skript zur automatischen Issue-Erstellung
- `scripts/README.md` - Detaillierte Dokumentation der Skripte
- `MISSING_ISSUES.md` - Übersicht der fehlenden Issues mit Prioritäten

## Schnellstart

### Option 1: Automatische Erstellung (empfohlen)

```bash
# Voraussetzungen prüfen
gh --version  # GitHub CLI muss installiert sein
gh auth status  # Muss authentifiziert sein

# Issues erstellen
cd scripts
node create-missing-issues.js
```

Das Skript:
- ✓ Liest alle Datentypen aus `pimcore-data-types.json`
- ✓ Filtert Typen, die bereits Issues haben
- ✓ Erstellt Issues im korrekten Format (deutscher Titel, Beschreibung, Labels)
- ✓ Vermeidet Rate Limiting durch Verzögerungen
- ✓ Gibt Zusammenfassung aus

### Option 2: Manuelle Erstellung

Falls automatische Erstellung nicht möglich ist:

1. Siehe `MISSING_ISSUES.md` für vollständige Liste
2. Verwende das Issue-Template:

```
Titel: Implement Anzeige und Bearbeitung für Pimcore Data Object Typ: [NAME]

Beschreibung:
Implementiere die Anzeige und Bearbeitung des Pimcore Data Object Typs "[NAME]" in unserer React Native App.

Referenz zur Komponente:
https://github.com/pimcore/studio-ui-bundle/blob/fa3c98a6f8fab12956374a2290a2c6c679a76cbe/assets/js/src/core/modules/element/dynamic-types/definitions/objects/data-related/types/[FILENAME]

[Implementierungshinweise basierend auf Kategorie]

Labels: documentation
```

### Option 3: Markdown-Export für Batch-Erstellung

```bash
cd scripts
node create-missing-issues.js > issues-export.md
```

Die Ausgabe enthält alle Issues im Markdown-Format zum Kopieren/Einfügen.

## Implementierungsprioritäten

### Hohe Priorität (10 Typen)
Basis-Datentypen, die in fast jedem Pimcore-Projekt verwendet werden:
- Input, Textarea, Select, Multiselect, Checkbox
- Date, DateTime, Numeric, Image, WYSIWYG

### Mittlere Priorität (10 Typen)
Häufig verwendete erweiterte Typen:
- Many-to-One Relation, Many-to-Many Object Relation
- Objects, Link, User, Country Multiselect
- Language, Table, Video, Localizedfields

### Niedrige Priorität (33 Typen)
Spezialisierte Typen je nach Projektbedarf

## Issue-Format

Alle Issues folgen demselben Muster wie die existierenden Issues #10-#14:

- **Deutscher Titel:** "Implement Anzeige und Bearbeitung für Pimcore Data Object Typ: [Name]"
- **Beschreibung:** 
  - Einleitung
  - Referenz-Link zur Pimcore Studio UI Bundle Komponente
  - Kategorie-spezifische Implementierungshinweise
- **Label:** `documentation`

## Nach der Issue-Erstellung

Nach erfolgreicher Erstellung der Issues sollte `scripts/pimcore-data-types.json` aktualisiert werden:

```json
{
  "name": "Input",
  "category": "text",
  "filename": "dynamic-type-object-data-input.tsx",
  "hasIssue": true,
  "issueNumber": 15
}
```

Dies verhindert, dass beim nächsten Lauf des Skripts doppelte Issues erstellt werden.

## Kategorien

Die Datentypen sind in folgende Kategorien eingeteilt:

| Kategorie | Anzahl | Beschreibung |
|-----------|---------|--------------|
| text | 10 | Texteingabe-Felder |
| numeric | 3 | Numerische Eingaben |
| date | 3 | Datums- und Zeitfelder |
| select | 8 | Auswahl-Felder |
| media | 7 | Medien-Felder |
| relation | 7 | Beziehungs-Felder |
| structured | 4 | Strukturierte Daten |
| geo | 4 | Geo-Daten |
| simple | 5 | Einfache Felder |
| special | 1 | Spezielle Felder |

## Fehlerbehebung

### "gh: command not found"
```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Windows
winget install GitHub.cli
```

### "authentication required"
```bash
gh auth login
```

### Rate Limiting
Das Skript enthält bereits eine 1-Sekunden-Verzögerung zwischen Requests. Bei Bedarf in `create-missing-issues.js` erhöhen.

## Referenzen

- [Pimcore Studio UI Bundle](https://github.com/pimcore/studio-ui-bundle)
- [Pimcore Documentation](https://pimcore.com/docs/)
- [GitHub CLI Documentation](https://cli.github.com/)
