# Fehlende Issues für Pimcore Data Object Typen

Dieses Dokument listet alle Pimcore Data Object Typen auf, für die noch Issues erstellt werden müssen.

## Status: Übersicht

**Gesamt:** 59 Datentypen  
**Mit Issues:** 6 Typen (Issues #8, #10, #11, #12, #13, #14)  
**Ohne Issues:** 53 Typen

## Existierende Issues

| # | Typ | Kategorie | Status |
|---|-----|-----------|--------|
| 8 | Country | select | ✓ Existiert |
| 10 | Advanced Many-to-Many Object Relation | relation | ✓ Existiert |
| 11 | Advanced Many-to-Many Relation | relation | ✓ Existiert |
| 12 | Block | structured | ✓ Existiert |
| 13 | Boolean Select | simple | ✓ Existiert |
| 14 | Calculated Value | special | ✓ Existiert |

## Fehlende Issues (53 Typen)

### Text-basierte Typen (10)
1. **Input** - Grundlegendes Texteingabefeld
2. **Textarea** - Mehrzeiliges Texteingabefeld
3. **Email** - Email-Eingabefeld mit Validierung
4. **Encrypted** - Verschlüsseltes Textfeld
5. **Firstname** - Vorname-Feld
6. **Lastname** - Nachname-Feld
7. **Password** - Passwort-Feld
8. **URL Slug** - URL-freundlicher Slug
9. **WYSIWYG** - Rich-Text-Editor
10. **Input Quantity Value** - Mengeneingabe mit Einheit

### Numerische Typen (3)
1. **Numeric** - Numerische Eingabe
2. **Slider** - Schieberegler für Wertauswahl
3. **Quantity Value** - Wert mit Maßeinheit

### Datums-/Zeittypen (3)
1. **Date** - Datumsauswahl
2. **DateTime** - Datums- und Zeitauswahl
3. **Time** - Zeitauswahl

### Auswahl-Typen (8)
1. **Select** - Einfachauswahl
2. **Multiselect** - Mehrfachauswahl
3. **Country Multiselect** - Länder-Mehrfachauswahl
4. **Language** - Sprachauswahl
5. **Language Multiselect** - Sprachen-Mehrfachauswahl
6. **Gender** - Geschlechtsauswahl
7. **User** - Benutzerauswahl
8. **Checkbox** - Checkbox

### Medien-Typen (7)
1. **Image** - Bildfeld
2. **Image Advanced** - Erweitertes Bildfeld
3. **Image Advanced with Hotspots** - Bild mit Hotspot-Funktionalität
4. **Image Gallery** - Bildergalerie
5. **Hot Spot Image** - Hotspot-Bild
6. **External Image** - Externes Bild (URL)
7. **Video** - Videofeld

### Beziehungs-Typen (6)
1. **Link** - Link/Verknüpfung
2. **Many-to-Many Relation** - n:m-Beziehung
3. **Many-to-One Relation** - n:1-Beziehung
4. **Many-to-Many Object Relation** - n:m-Objekt-Beziehung
5. **Objects** - Objektreferenzen
6. **Objects Metadata** - Objekte mit Metadaten
7. **Reverse Many-to-Many Object Relation** - Reverse n:m-Objekt-Beziehung

### Strukturierte Daten (4)
1. **Table** - Tabelle
2. **Structured Table** - Strukturierte Tabelle
3. **Fieldcollections** - Feldsammlungen
4. **Localizedfields** - Lokalisierte Felder

### Geo-Daten (4)
1. **Geopoint** - Geografischer Punkt
2. **Geobounds** - Geografische Begrenzung
3. **Geopolygon** - Geografisches Polygon
4. **Geopolyline** - Geografische Polylinie

### Einfache Typen (3)
1. **Consent** - Zustimmungsfeld
2. **Newsletter Active** - Newsletter-Aktivstatus
3. **Newsletter Confirmed** - Newsletter-Bestätigungsstatus
4. **RGBAColor** - RGBA-Farbauswahl

## Nächste Schritte

### Automatische Erstellung
Verwende das Skript `scripts/create-missing-issues.js` um alle fehlenden Issues automatisch zu erstellen:

```bash
cd scripts
node create-missing-issues.js
```

**Voraussetzungen:**
- Node.js installiert
- GitHub CLI (`gh`) installiert und authentifiziert
- Schreibrechte auf Repository `dpfaffenbauer/PimcoreVoyager`

### Manuelle Erstellung
Falls die automatische Erstellung nicht möglich ist, können Issues manuell erstellt werden. Verwende dabei folgendes Template:

**Titel:**
```
Implement Anzeige und Bearbeitung für Pimcore Data Object Typ: [NAME]
```

**Beschreibung:**
```
Implementiere die Anzeige und Bearbeitung des Pimcore Data Object Typs "[NAME]" in unserer React Native App.

Referenz zur Komponente:
https://github.com/pimcore/studio-ui-bundle/blob/1.x/assets/js/src/core/modules/element/dynamic-types/definitions/objects/data-related/types/[FILENAME]

[Kategorie-spezifische Implementierungshinweise]
```

**Labels:**
- `documentation`

## Prioritäten-Empfehlung

### Hohe Priorität (Basisfunktionalität)
Diese Typen werden am häufigsten in Pimcore-Projekten verwendet:
1. Input
2. Textarea
3. Select
4. Multiselect
5. Checkbox
6. Date
7. DateTime
8. Numeric
9. Image
10. WYSIWYG

### Mittlere Priorität (Erweiterte Funktionen)
11. Many-to-One Relation
12. Many-to-Many Object Relation
13. Objects
14. Link
15. User
16. Country Multiselect
17. Language
18. Table
19. Video
20. Localizedfields

### Niedrige Priorität (Spezialfälle)
Restliche Typen je nach Projektanforderung

## Referenzen

- [Pimcore Studio UI Bundle](https://github.com/pimcore/studio-ui-bundle)
- [Pimcore Data Object Types Documentation](https://pimcore.com/docs/)
- [Pimcore Voyager Issues](https://github.com/dpfaffenbauer/PimcoreVoyager/issues)
