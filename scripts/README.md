# Scripts für Pimcore Voyager

Dieses Verzeichnis enthält Hilfsskripte für die Verwaltung des Pimcore Voyager Projekts.

## create-missing-issues.js

Dieses Skript erstellt automatisch GitHub Issues für Pimcore Data Object Typen, die noch keine Issues haben.

### Voraussetzungen

- Node.js installiert
- GitHub CLI (`gh`) installiert und authentifiziert
- Schreibrechte auf das Repository `dpfaffenbauer/PimcoreVoyager`

### Installation GitHub CLI

```bash
# macOS
brew install gh

# Ubuntu/Debian
sudo apt install gh

# Windows
winget install GitHub.cli
```

Nach der Installation:
```bash
gh auth login
```

### Verwendung

```bash
# Aus dem scripts-Verzeichnis
node create-missing-issues.js

# Oder von überall mit vollem Pfad
node /pfad/zu/scripts/create-missing-issues.js
```

### Was macht das Skript?

1. Liest die Datei `pimcore-data-types.json` ein
2. Filtert alle Data Object Typen heraus, die noch kein Issue haben (`hasIssue: false` oder fehlt)
3. Erstellt für jeden fehlenden Typ ein GitHub Issue mit:
   - Deutschen Titel im Format: "Implement Anzeige und Bearbeitung für Pimcore Data Object Typ: [Name]"
   - Beschreibung mit Referenz zur Pimcore Studio UI Bundle Komponente
   - Implementierungshinweise basierend auf der Kategorie
   - Label "documentation"

### pimcore-data-types.json

Diese Datei enthält eine Liste aller Pimcore Data Object Typen mit folgenden Informationen:

- `name`: Name des Datentyps
- `category`: Kategorie (text, numeric, date, select, media, relation, structured, geo, simple, special)
- `filename`: Dateiname der Referenz-Komponente im Pimcore Studio UI Bundle
- `hasIssue`: (optional) `true` wenn bereits ein Issue existiert
- `issueNumber`: (optional) Nummer des existierenden Issues

### Manuelles Hinzufügen neuer Datentypen

Um einen neuen Datentyp zur Liste hinzuzufügen, füge ein neues Objekt zum `dataTypes` Array in `pimcore-data-types.json` hinzu:

```json
{
  "name": "Neuer Typ",
  "category": "text",
  "filename": "dynamic-type-object-data-neuer-typ.tsx"
}
```

Führe dann das Skript aus, um das Issue zu erstellen.

### Aktualisieren nach Issue-Erstellung

Nach erfolgreicher Erstellung eines Issues sollte die `pimcore-data-types.json` aktualisiert werden:

```json
{
  "name": "Neuer Typ",
  "category": "text",
  "filename": "dynamic-type-object-data-neuer-typ.tsx",
  "hasIssue": true,
  "issueNumber": 15
}
```

## Kategorien und ihre Bedeutung

- **text**: Texteingabe-Felder (Input, Textarea, Email, etc.)
- **numeric**: Numerische Eingaben (Number, Slider, Quantity Value)
- **date**: Datums- und Zeitfelder (Date, DateTime, Time)
- **select**: Auswahl-Felder (Select, Multiselect, Country, Language, User)
- **media**: Medien-Felder (Image, Video, Image Gallery)
- **relation**: Beziehungs-Felder (Many-to-Many, Many-to-One, Objects)
- **structured**: Strukturierte Daten (Table, Block, Fieldcollections, Localizedfields)
- **geo**: Geo-Daten (Geopoint, Geobounds, Geopolygon, Geopolyline)
- **simple**: Einfache Felder (Checkbox, Consent, Boolean Select)
- **special**: Spezielle Felder (Calculated Value)

## Fehlerbehebung

### "gh: command not found"
Die GitHub CLI ist nicht installiert. Siehe Installation oben.

### "authentication required"
Authentifizierung fehlt. Führe `gh auth login` aus.

### "permission denied"
Keine Schreibrechte auf das Repository. Kontaktiere den Repository-Besitzer.

### Rate Limiting
Wenn zu viele Issues auf einmal erstellt werden, kann es zu Rate Limiting kommen. Das Skript enthält bereits eine Verzögerung von 1 Sekunde zwischen den Requests. Bei Bedarf kann diese in der `main()`-Funktion erhöht werden.
