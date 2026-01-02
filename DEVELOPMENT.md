# Pimcore Voyager - Developer Documentation

> **Letzte Aktualisierung:** Januar 2025
> **Version:** 1.0.0

---

## Inhaltsverzeichnis

1. [Überblick](#überblick)
2. [Schnellstart](#schnellstart)
3. [Projektstruktur](#projektstruktur)
4. [Architektur](#architektur)
5. [API Services](#api-services)
6. [Screens](#screens)
7. [Components](#components)
8. [State Management](#state-management)
9. [Navigation](#navigation)
10. [Pimcore Studio API](#pimcore-studio-api)
11. [Building & Deployment](#building--deployment)
12. [Testing](#testing)
13. [Troubleshooting](#troubleshooting)
14. [Contributing](#contributing)

---

## Überblick

Pimcore Voyager ist eine React Native/Expo Mobile App für die Verwaltung von Pimcore-Inhalten. Die App kommuniziert mit der Pimcore Studio API und unterstützt:

- **Datenobjekte**: Browsen, Anzeigen, Workflow-Management
- **Assets**: Medienbibliothek durchsuchen und anzeigen
- **Dokumente**: Dokumentbaum und Details
- **Suche**: Globale Suche über alle Inhaltstypen
- **Multi-Instanz**: Mehrere Pimcore-Server verwalten

### Tech Stack

| Technologie | Version | Verwendung |
|-------------|---------|------------|
| React Native | 0.81.5 | Mobile Framework |
| Expo | 54.x | Build & Dev Toolchain |
| TypeScript | 5.9.x | Typsicherheit |
| React Navigation | 7.x | Navigation |
| React Native Paper | 5.x | UI Components |
| Zustand | 5.x | State Management |
| Axios | 1.x | HTTP Client |

---

## Schnellstart

### Voraussetzungen

- Node.js 20.x oder höher
- npm oder yarn
- Xcode 15+ (für iOS)
- Android Studio (für Android)
- Pimcore 11.x mit Studio UI Bundle

### Installation

```bash
# Repository klonen
git clone https://github.com/cors-gmbh/pimcore-voyager.git
cd pimcore-voyager

# Dependencies installieren
npm install

# iOS Pods installieren (bei CocoaPods-Problemen)
cd ios && pod install && cd ..

# Development Server starten
npm start
```

### Development Build

```bash
# iOS Device (mit Dev Client)
npx expo run:ios --device

# iOS Simulator
npx expo run:ios

# Android
npx expo run:android

# Release Build für iOS
npx expo run:ios --device --configuration Release
```

---

## Projektstruktur

```
pimcore-voyager/
├── src/
│   ├── apis/                      # API Layer
│   │   ├── apiClient.ts           # Axios Konfiguration
│   │   ├── authService.ts         # Authentifizierung
│   │   ├── pimcoreService.ts      # Facade (re-exportiert alle Services)
│   │   ├── dataObjectService.ts   # Datenobjekt-Operationen
│   │   ├── assetService.ts        # Asset-Operationen
│   │   ├── documentService.ts     # Dokument-Operationen
│   │   ├── classService.ts        # Klassendefinitionen
│   │   ├── workflowService.ts     # Workflow-Operationen
│   │   └── searchService.ts       # Such-Funktionalität
│   │
│   ├── components/                # Wiederverwendbare Komponenten
│   │   ├── FieldRenderer.tsx      # Dynamisches Feld-Rendering
│   │   ├── WorkflowSection.tsx    # Workflow Status Anzeige
│   │   ├── WorkflowActionDialog.tsx # Workflow Aktions-Dialog
│   │   ├── CustomDrawer.tsx       # Navigation Drawer
│   │   └── FloatingActionMenu.tsx # FAB Menü
│   │
│   ├── screens/                   # Screen Komponenten
│   │   ├── LoginScreen.tsx
│   │   ├── InstanceSelectionScreen.tsx
│   │   ├── AddEditInstanceScreen.tsx
│   │   ├── DataObjectsScreen.tsx
│   │   ├── ObjectListScreen.tsx
│   │   ├── ObjectDetailScreen.tsx
│   │   ├── FolderDetailScreen.tsx
│   │   ├── AssetsScreen.tsx
│   │   ├── AssetDetailScreen.tsx
│   │   ├── DocumentsScreen.tsx
│   │   ├── DocumentDetailScreen.tsx
│   │   ├── SearchScreen.tsx
│   │   └── SettingsScreen.tsx
│   │
│   ├── navigation/                # Navigation Konfiguration
│   │   └── AppNavigation.tsx
│   │
│   ├── store/                     # Zustand Stores
│   │   ├── authStore.ts           # Auth State
│   │   ├── appStore.ts            # App State
│   │   └── instanceStore.ts       # Multi-Instanz State
│   │
│   ├── types/                     # TypeScript Definitionen
│   │   ├── pimcore.ts             # Pimcore Typen
│   │   ├── auth.ts                # Auth Typen
│   │   └── instance.ts            # Instanz Typen
│   │
│   └── config/                    # Konfiguration
│       ├── env.ts                 # Environment
│       └── constants.ts           # Konstanten
│
├── assets/                        # Statische Assets
│   └── logo.png
│
├── ios/                           # Native iOS Projekt
├── android/                       # Native Android Projekt
│
├── .github/
│   └── workflows/
│       └── cla-check.yml          # CLA Bot
│
├── App.tsx                        # Root Component
├── app.json                       # Expo Config
├── eas.json                       # EAS Build Config
├── package.json
├── tsconfig.json
├── LICENSE.md                     # PVL Lizenz
├── CLA.md                         # Contributor License Agreement
└── README.md
```

---

## Architektur

### Schichtenarchitektur

```
┌─────────────────────────────────────────────────────┐
│                    Screens                          │
│  (UI Layer - React Native Components)               │
├─────────────────────────────────────────────────────┤
│                   Components                        │
│  (Wiederverwendbare UI-Bausteine)                   │
├─────────────────────────────────────────────────────┤
│                 State Management                    │
│  (Zustand Stores - authStore, appStore, etc.)       │
├─────────────────────────────────────────────────────┤
│                   API Services                      │
│  (DataObjectService, AssetService, etc.)            │
├─────────────────────────────────────────────────────┤
│                   API Client                        │
│  (Axios mit Interceptors)                           │
├─────────────────────────────────────────────────────┤
│              Pimcore Studio API                     │
│  (Backend)                                          │
└─────────────────────────────────────────────────────┘
```

### Datenfluss

```
User Action → Screen → Store Action → API Service → Backend
                ↑                                      ↓
                └──────── State Update ←───────────────┘
```

---

## API Services

Die API-Layer ist modular aufgebaut. Jeder Service ist für einen Bereich zuständig.

### Service-Übersicht

| Service | Datei | Beschreibung |
|---------|-------|--------------|
| `PimcoreService` | `pimcoreService.ts` | Facade - re-exportiert alle Services |
| `DataObjectService` | `dataObjectService.ts` | Datenobjekt CRUD |
| `AssetService` | `assetService.ts` | Asset-Operationen |
| `DocumentService` | `documentService.ts` | Dokument-Operationen |
| `ClassService` | `classService.ts` | Klassendefinitionen & Layouts |
| `WorkflowService` | `workflowService.ts` | Workflow Status & Aktionen |
| `SearchService` | `searchService.ts` | Globale Suche |
| `AuthService` | `authService.ts` | Login/Logout |

### DataObjectService

```typescript
// Datenobjekte laden
DataObjectService.getDataObjects(classId?, page?, limit?, parentId?)

// Einzelnes Objekt laden
DataObjectService.getDataObject(id)

// Objekt mit allen Felddaten laden
DataObjectService.getDataObjectFull(id)

// Layout/Feldstruktur laden
DataObjectService.getDataObjectLayout(id)

// Baumstruktur laden
DataObjectService.getTreeLevel(parentId)

// Grid-Daten für Ordner
DataObjectService.getGridConfiguration(folderId, classId, page, limit)
```

### WorkflowService

```typescript
// Workflow-Details laden (Status, Transitions, Global Actions)
WorkflowService.getWorkflowDetails(elementId, elementType)

// Workflow-Aktion ausführen
WorkflowService.triggerWorkflowAction({
  actionType: 'transition' | 'global',
  elementId,
  elementType,
  workflowId,
  transitionId?,
  actionId?,
  workflowOptions?
})
```

### ClassService

```typescript
// Alle Klassendefinitionen
ClassService.getClassDefinitions()

// Einzelne Klassendefinition
ClassService.getClassDefinition(classId)

// Klassen in einem Ordner
ClassService.getFolderClasses(folderId)

// Field Collection Layouts
ClassService.getFieldCollectionLayouts(objectId)

// Object Brick Layouts
ClassService.getObjectBrickLayouts(objectId)
```

### Verwendung

```typescript
// Option 1: Einzelne Services importieren
import { DataObjectService, WorkflowService } from '../apis/pimcoreService';

// Option 2: Facade verwenden (rückwärtskompatibel)
import { PimcoreService } from '../apis/pimcoreService';
PimcoreService.getDataObject(123);
```

---

## Screens

### Screen-Übersicht

| Screen | Datei | Beschreibung |
|--------|-------|--------------|
| `LoginScreen` | `LoginScreen.tsx` | Benutzeranmeldung |
| `InstanceSelectionScreen` | `InstanceSelectionScreen.tsx` | Pimcore-Instanz auswählen |
| `AddEditInstanceScreen` | `AddEditInstanceScreen.tsx` | Instanz hinzufügen/bearbeiten |
| `DataObjectsScreen` | `DataObjectsScreen.tsx` | Datenobjekt-Baumstruktur |
| `ObjectListScreen` | `ObjectListScreen.tsx` | Objektliste einer Klasse |
| `ObjectDetailScreen` | `ObjectDetailScreen.tsx` | Objektdetails mit Feldern |
| `FolderDetailScreen` | `FolderDetailScreen.tsx` | Ordnerinhalt mit Grid |
| `AssetsScreen` | `AssetsScreen.tsx` | Asset-Baumstruktur |
| `AssetDetailScreen` | `AssetDetailScreen.tsx` | Asset-Details |
| `DocumentsScreen` | `DocumentsScreen.tsx` | Dokument-Baumstruktur |
| `DocumentDetailScreen` | `DocumentDetailScreen.tsx` | Dokument-Details |
| `SearchScreen` | `SearchScreen.tsx` | Globale Suche |
| `SettingsScreen` | `SettingsScreen.tsx` | App-Einstellungen |

### ObjectDetailScreen Features

- Header mit Objekt-Metadaten
- Tab-Navigation für Layout-Panels
- Dynamisches Feld-Rendering via `FieldRenderer`
- Workflow-Status Anzeige
- Menü mit:
  - Workflow-Aktionen (Transitions, Global Actions)
  - Objektinformationen
  - Berechtigungen
- Pull-to-Refresh

### FolderDetailScreen Features

- **Responsives Split-Layout**: Automatische Anpassung basierend auf Bildschirmbreite
  - **Tablet (> 768px)**: Side-by-side Layout mit Klassen-Sidebar links und Objektliste rechts
  - **Phone (≤ 768px)**: Gestapeltes Layout mit Dropdown-Klassenauswahl
- Klassen-Auswahl pro Ordner
- Grid-Ansicht der Objekte
- Paginierung mit "Mehr laden"
- Pull-to-Refresh

```typescript
// Breakpoint Konstante
const SPLIT_LAYOUT_BREAKPOINT = 768;

// Hook für responsive Erkennung
const { width } = useWindowDimensions();
const isSplitLayout = width > SPLIT_LAYOUT_BREAKPOINT;
```

---

## Components

### FieldRenderer

Dynamisches Rendering aller Pimcore-Feldtypen.

**Unterstützte Feldtypen:**

| Kategorie | Feldtypen |
|-----------|-----------|
| Text | input, textarea, wysiwyg, password |
| Numerisch | numeric, slider, quantityValue |
| Auswahl | select, multiselect, booleanSelect |
| Datum/Zeit | date, datetime, time, dateRange |
| Relationen | manyToOneRelation, manyToManyRelation, manyToManyObjectRelation |
| Strukturiert | fieldcollections, objectbricks, block, classificationstore |
| Geo | geopoint, geobounds, geopolygon, geopolyline |
| Media | image, video, hotspotimage, imageGallery |
| Sonstige | link, table, structuredTable, checkbox, rgbaColor |

**Verwendung:**

```tsx
import { LayoutNodeRenderer } from '../components/FieldRenderer';

<LayoutNodeRenderer
  node={layoutNode}
  objectData={objectData}
  level={0}
  fieldCollectionLayouts={fieldCollectionLayouts}
  objectBrickLayouts={objectBrickLayouts}
/>
```

### WorkflowSection

Zeigt Workflow-Status-Badges für Objekte an.

```tsx
import { WorkflowSection } from '../components/WorkflowSection';

<WorkflowSection workflows={workflowItems} />
```

**Props:**
- `workflows: WorkflowItem[]` - Array von Workflow-Items

### WorkflowActionDialog

Modal-Dialog für Workflow-Aktionen mit Unterstützung für Kommentare und zusätzliche Felder.

```tsx
import { WorkflowActionDialog, WorkflowActionData } from '../components/WorkflowActionDialog';

<WorkflowActionDialog
  visible={dialogVisible}
  title="Aktion ausführen"
  notes={actionNotes}
  loading={isLoading}
  onCancel={() => setDialogVisible(false)}
  onSubmit={(data: WorkflowActionData) => handleSubmit(data)}
/>
```

**Props:**
- `visible: boolean` - Dialog sichtbar/versteckt
- `title: string` - Titel des Dialogs
- `notes: WorkflowNotes` - Konfiguration für Kommentar und zusätzliche Felder
- `loading?: boolean` - Ladezustand während Ausführung
- `onCancel: () => void` - Callback bei Abbruch
- `onSubmit: (data: WorkflowActionData) => void` - Callback bei Absenden

**Unterstützte Feldtypen:**

| Typ | Beschreibung |
|-----|--------------|
| `input` | Einzeiliges Textfeld |
| `numeric` | Numerische Eingabe |
| `textarea` | Mehrzeiliges Textfeld |
| `select` | Dropdown-Auswahl |
| `checkbox` | Checkbox |
| `date` | Datumsauswahl |
| `datetime` | Datum + Uhrzeit |
| `user` | Benutzer-ID Eingabe |

**Beispiel API Payload:**
```json
{
  "actionType": "global",
  "elementId": 1088,
  "elementType": "data-object",
  "workflowId": "product_data_enrichment",
  "transitionId": "log_time",
  "workflowOptions": {
    "notes": "Kommentar hier",
    "additional": {
      "timeWorked": "10",
      "priority": "high"
    }
  }
}
```

---

## State Management

### Zustand Stores

#### authStore

```typescript
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

// Actions
login(username, password)
logout()
checkAuth()
```

#### instanceStore

```typescript
interface InstanceState {
  instances: PimcoreInstance[];
  currentInstance: PimcoreInstance | null;
}

// Actions
addInstance(instance)
updateInstance(id, instance)
deleteInstance(id)
setCurrentInstance(instance)
loadInstances()
```

#### appStore

```typescript
interface AppState {
  classDefinitions: ClassDefinition[];
  isLoading: boolean;
}

// Actions
loadClassDefinitions()
```

### Verwendung

```typescript
import { useAuthStore } from '../store/authStore';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  // ...
}
```

---

## Navigation

### Navigationsstruktur

```
Root Navigator (Stack)
├── InstanceSelection (wenn keine Instanz ausgewählt)
├── Login (wenn nicht authentifiziert)
└── Main Navigator (Drawer)
    ├── Data Objects Stack
    │   ├── DataObjectsScreen (Baumansicht)
    │   ├── ObjectListScreen (Objektliste)
    │   ├── ObjectDetailScreen (Objektdetails)
    │   └── FolderDetailScreen (Ordnerinhalt)
    ├── Assets Stack
    │   ├── AssetsScreen (Baumansicht)
    │   └── AssetDetailScreen (Asset-Details)
    ├── Documents Stack
    │   ├── DocumentsScreen (Baumansicht)
    │   └── DocumentDetailScreen (Dokument-Details)
    ├── Search Stack
    │   └── SearchScreen
    └── Settings Stack
        ├── SettingsScreen
        └── AddEditInstanceScreen
```

### Navigation Types

```typescript
// In navigation/AppNavigation.tsx definiert
type RootStackParamList = {
  InstanceSelection: undefined;
  Login: undefined;
  Main: undefined;
};

type DataObjectsStackParamList = {
  DataObjects: undefined;
  ObjectList: { classId: string; className: string };
  ObjectDetail: { object: PimcoreDataObject };
  FolderDetail: { folder: PimcoreDataObject };
};
```

---

## Pimcore Studio API

### Basis-URL

```
https://your-pimcore.com/pimcore-studio/api
```

### Authentifizierung

Session-basiert mit Cookies:

```typescript
// Login
POST /pimcore-studio/api/login
Body: { username, password }

// Logout
POST /pimcore-studio/api/logout
```

### Wichtige Endpoints

#### Data Objects

```
GET  /data-objects/tree?parentId={id}      # Baumstruktur
GET  /data-objects/{id}                     # Einzelnes Objekt
GET  /data-objects/{id}/layout              # Layout/Feldstruktur
POST /data-objects/grid/{classId}           # Grid-Daten
```

#### Assets

```
GET  /assets/tree?parentId={id}             # Baumstruktur
GET  /assets/{id}                           # Einzelnes Asset
```

#### Documents

```
GET  /documents/tree?parentId={id}          # Baumstruktur
GET  /documents/{id}                        # Einzelnes Dokument
```

#### Workflows

```
GET  /workflows/details?elementId={id}&elementType={type}
POST /workflows/action
```

#### Classes

```
GET  /class/collection                      # Alle Klassen
GET  /class/definition/{classId}            # Einzelne Klasse
GET  /class/folder/{folderId}               # Klassen in Ordner
GET  /class/field-collection/{objectId}/object/layout
GET  /class/object-brick/{objectId}/object/layout
```

#### Search

```
GET  /search?query={q}&type={type}
```

---

## Building & Deployment

### Development Build

```bash
# iOS mit Dev Client
npx expo run:ios --device

# Android
npx expo run:android --device
```

### Release Build (Lokal)

```bash
# iOS Release
npx expo run:ios --device --configuration Release
```

### EAS Build (Cloud)

```bash
# Development
eas build --profile development --platform ios

# Preview (Internal Testing)
eas build --profile preview --platform ios

# Production
eas build --profile production --platform ios
```

### TestFlight Upload

1. Xcode öffnen:
   ```bash
   open ios/PimcoreVoyager.xcworkspace
   ```

2. In Xcode:
   - Product → Destination → Any iOS Device
   - Product → Archive
   - Distribute App → App Store Connect → Upload

### App Store Submission

```bash
# Via EAS Submit
eas build --profile production --platform ios
eas submit --platform ios
```

### Build-Profile (eas.json)

| Profil | Verwendung |
|--------|------------|
| `development` | Dev Client mit Debug-Features |
| `preview` | Internal Testing (APK/IPA) |
| `production` | App Store Release |

---

## Testing

### TypeScript Check

```bash
npx tsc --noEmit
```

### Linting

```bash
npm run lint
```

### Unit Tests (wenn eingerichtet)

```bash
npm test
```

---

## Troubleshooting

### CocoaPods Probleme

```bash
# Bei RVM/Ruby Konflikten
env -u GEM_PATH -u GEM_HOME /opt/homebrew/bin/pod install

# Pods neu installieren
cd ios && rm -rf Pods Podfile.lock && pod install
```

### iOS Build Fehler

```bash
# Clean Build
cd ios && xcodebuild clean && cd ..
npx expo prebuild --clean
```

### Metro Bundler Reset

```bash
npx expo start --clear
```

### Xcode Signing

1. Xcode öffnen
2. Target "PimcoreVoyager" auswählen
3. Signing & Capabilities
4. Team auswählen
5. "Automatically manage signing" aktivieren

### iOS Simulator nicht gefunden

```bash
# Verfügbare Simulatoren anzeigen
xcrun simctl list devices available
```

---

## Customization

Dieser Abschnitt beschreibt, wie die App für spezifische Use-Cases angepasst werden kann.

> **Hinweis:** Für angepasste/geforkte Versionen ist eine kommerzielle Lizenz erforderlich. Siehe [LICENSE.md](LICENSE.md).

### Übersicht der Anpassungsmöglichkeiten

| Anpassung | Schwierigkeit | Beschreibung |
|-----------|---------------|--------------|
| Custom Detail Layouts | Mittel | Eigene Layouts für bestimmte Klassen |
| Custom Field Renderer | Mittel | Eigene Renderer für spezielle Feldtypen |
| Custom Screens | Fortgeschritten | Komplett eigene Screens für Klassen |
| Custom Create Forms | Fortgeschritten | Eigene Formulare zum Anlegen (geplant) |
| Theming | Einfach | Farben, Fonts, Branding |

---

### Custom Detail Layouts für Klassen

Du kannst für bestimmte Pimcore-Klassen eigene Detail-Layouts erstellen.

#### Schritt 1: Custom Layout Component erstellen

```tsx
// src/components/custom-layouts/ProductDetailLayout.tsx

import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Title, Text, Chip } from 'react-native-paper';

interface ProductDetailLayoutProps {
  objectData: any;
  object: any;
}

export function ProductDetailLayout({ objectData, object }: ProductDetailLayoutProps) {
  return (
    <View style={styles.container}>
      {/* Hero Image */}
      {objectData.mainImage && (
        <Image
          source={{ uri: objectData.mainImage.fullpath }}
          style={styles.heroImage}
        />
      )}

      {/* Product Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>{objectData.name || object.key}</Title>
          <Text style={styles.sku}>SKU: {objectData.sku}</Text>

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>€ {objectData.price}</Text>
            {objectData.salePrice && (
              <Chip style={styles.saleChip}>Sale: € {objectData.salePrice}</Chip>
            )}
          </View>

          {/* Categories */}
          <View style={styles.categories}>
            {objectData.categories?.map((cat: any, idx: number) => (
              <Chip key={idx} style={styles.categoryChip}>{cat.name}</Chip>
            ))}
          </View>

          {/* Description */}
          <Text style={styles.description}>{objectData.description}</Text>
        </Card.Content>
      </Card>

      {/* Specifications */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Spezifikationen</Title>
          {objectData.specifications?.map((spec: any, idx: number) => (
            <View key={idx} style={styles.specRow}>
              <Text style={styles.specLabel}>{spec.label}</Text>
              <Text style={styles.specValue}>{spec.value}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroImage: { width: '100%', height: 250, resizeMode: 'cover' },
  card: { margin: 12, borderRadius: 12 },
  sku: { color: '#666', marginBottom: 8 },
  priceContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 12 },
  price: { fontSize: 24, fontWeight: 'bold', color: '#2e7d32' },
  saleChip: { backgroundColor: '#ffebee' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  categoryChip: { backgroundColor: '#e3f2fd' },
  description: { marginTop: 12, lineHeight: 22 },
  specRow: { flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  specLabel: { flex: 1, fontWeight: '600' },
  specValue: { flex: 1 },
});
```

#### Schritt 2: Layout Registry erstellen

```tsx
// src/config/customLayouts.ts

import { ProductDetailLayout } from '../components/custom-layouts/ProductDetailLayout';
import { CustomerDetailLayout } from '../components/custom-layouts/CustomerDetailLayout';

// Registry für Custom Layouts nach Klassenname
export const customDetailLayouts: Record<string, React.ComponentType<any>> = {
  'Product': ProductDetailLayout,
  'Customer': CustomerDetailLayout,
  // Weitere Klassen hier hinzufügen
};

// Helper-Funktion
export function getCustomLayout(className: string) {
  return customDetailLayouts[className] || null;
}
```

#### Schritt 3: In ObjectDetailScreen integrieren

```tsx
// In src/screens/ObjectDetailScreen.tsx

import { getCustomLayout } from '../config/customLayouts';

// Im Component:
const CustomLayout = getCustomLayout(object.className);

// Im Render:
{CustomLayout ? (
  <CustomLayout objectData={objectData.objectData} object={object} />
) : (
  // Standard FieldRenderer Layout
  <LayoutNodeRenderer ... />
)}
```

---

### Custom Field Renderer

Für spezielle Feldtypen oder Pimcore-Plugins kannst du eigene Renderer erstellen.

#### Schritt 1: Custom Renderer erstellen

```tsx
// src/components/custom-renderers/ColorSwatchRenderer.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ColorSwatchRendererProps {
  value: string; // HEX Color
  fieldName: string;
  title?: string;
}

export function ColorSwatchRenderer({ value, fieldName, title }: ColorSwatchRendererProps) {
  if (!value) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{title || fieldName}</Text>
      <View style={styles.swatchRow}>
        <View style={[styles.swatch, { backgroundColor: value }]} />
        <Text style={styles.hexValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 12, color: '#666', marginBottom: 4 },
  swatchRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  swatch: { width: 40, height: 40, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  hexValue: { fontSize: 14, fontFamily: 'monospace' },
});
```

#### Schritt 2: Renderer Registry erweitern

```tsx
// src/config/customRenderers.ts

import { ColorSwatchRenderer } from '../components/custom-renderers/ColorSwatchRenderer';
import { RatingRenderer } from '../components/custom-renderers/RatingRenderer';

// Registry für Custom Renderer nach Feldtyp
export const customFieldRenderers: Record<string, React.ComponentType<any>> = {
  'colorPicker': ColorSwatchRenderer,
  'rating': RatingRenderer,
  'customPlugin.specialField': MySpecialRenderer,
};

export function getCustomRenderer(fieldType: string) {
  return customFieldRenderers[fieldType] || null;
}
```

#### Schritt 3: In FieldRenderer integrieren

```tsx
// In src/components/FieldRenderer.tsx, in der renderField Funktion:

import { getCustomRenderer } from '../config/customRenderers';

// Am Anfang von renderField:
const CustomRenderer = getCustomRenderer(fieldDefinition.fieldtype);
if (CustomRenderer) {
  return <CustomRenderer value={value} fieldName={fieldName} title={fieldDefinition.title} />;
}

// Danach Standard-Rendering...
```

---

### Custom Screens für Klassen

Für komplexe Use-Cases kannst du komplett eigene Screens erstellen.

#### Schritt 1: Custom Screen erstellen

```tsx
// src/screens/custom/OrderDetailScreen.tsx

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Card, Title, Text, DataTable, Button, Chip } from 'react-native-paper';
import { PimcoreService } from '../../apis/pimcoreService';

export function OrderDetailScreen({ route, navigation }) {
  const { object } = route.params;
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderData();
  }, []);

  const loadOrderData = async () => {
    const fullObject = await PimcoreService.getDataObjectFull(object.id);
    setOrderData(fullObject.objectData);
    setLoading(false);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <ScrollView style={styles.container}>
      {/* Order Header */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.orderHeader}>
            <Title>Bestellung #{orderData.orderNumber}</Title>
            <Chip style={getStatusStyle(orderData.status)}>
              {orderData.status}
            </Chip>
          </View>
          <Text>Datum: {formatDate(orderData.orderDate)}</Text>
          <Text>Kunde: {orderData.customer?.name}</Text>
        </Card.Content>
      </Card>

      {/* Order Items */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>Positionen</Title>
          <DataTable>
            <DataTable.Header>
              <DataTable.Title>Artikel</DataTable.Title>
              <DataTable.Title numeric>Menge</DataTable.Title>
              <DataTable.Title numeric>Preis</DataTable.Title>
            </DataTable.Header>
            {orderData.items?.map((item: any, idx: number) => (
              <DataTable.Row key={idx}>
                <DataTable.Cell>{item.product?.name}</DataTable.Cell>
                <DataTable.Cell numeric>{item.quantity}</DataTable.Cell>
                <DataTable.Cell numeric>€ {item.price}</DataTable.Cell>
              </DataTable.Row>
            ))}
          </DataTable>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Gesamt:</Text>
            <Text style={styles.totalValue}>€ {orderData.total}</Text>
          </View>
        </Card.Content>
      </Card>

      {/* Actions */}
      <View style={styles.actions}>
        <Button mode="contained" onPress={() => handleStatusChange('processing')}>
          In Bearbeitung
        </Button>
        <Button mode="contained" onPress={() => handleStatusChange('shipped')}>
          Versandt
        </Button>
      </View>
    </ScrollView>
  );
}
```

#### Schritt 2: Screen Registry erstellen

```tsx
// src/config/customScreens.ts

import { OrderDetailScreen } from '../screens/custom/OrderDetailScreen';
import { CustomerDetailScreen } from '../screens/custom/CustomerDetailScreen';

// Registry für Custom Screens nach Klassenname
export const customDetailScreens: Record<string, React.ComponentType<any>> = {
  'Order': OrderDetailScreen,
  'Customer': CustomerDetailScreen,
};

export function getCustomScreen(className: string) {
  return customDetailScreens[className] || null;
}
```

#### Schritt 3: Navigation anpassen

```tsx
// In src/navigation/AppNavigation.tsx

import { getCustomScreen } from '../config/customScreens';

// In DataObjectsStack, dynamisch Custom Screens registrieren:
{Object.entries(customDetailScreens).map(([className, Screen]) => (
  <Stack.Screen
    key={className}
    name={`${className}Detail`}
    component={Screen}
    options={{ title: className }}
  />
))}
```

---

### Theming & Branding

#### App-weite Farben anpassen

```tsx
// src/config/theme.ts

export const theme = {
  colors: {
    primary: '#your-brand-color',
    secondary: '#your-secondary-color',
    accent: '#your-accent-color',
    background: '#f8f9fa',
    surface: '#ffffff',
    error: '#f44336',
    success: '#4caf50',
    warning: '#ff9800',
  },
  gradients: {
    header: ['#your-gradient-start', '#your-gradient-end'],
    folder: ['#folder-start', '#folder-end'],
  },
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },
};
```

#### Logo & Branding

1. Logo ersetzen: `assets/logo.png`
2. Splash Screen: `app.json` → `splash` Konfiguration
3. App Icon: `app.json` → `icon` Konfiguration

---

### Custom Create Forms (Geplant)

> **Status:** In Entwicklung

Zukünftig wird es möglich sein, eigene Formulare zum Anlegen von Objekten zu definieren:

```tsx
// Geplante API (Beispiel)
// src/config/customForms.ts

export const customCreateForms: Record<string, FormConfig> = {
  'Product': {
    title: 'Neues Produkt anlegen',
    steps: [
      {
        title: 'Basis-Informationen',
        fields: ['name', 'sku', 'category'],
      },
      {
        title: 'Preise',
        fields: ['price', 'salePrice', 'taxRate'],
      },
      {
        title: 'Medien',
        fields: ['mainImage', 'gallery'],
      },
    ],
    validation: {
      name: { required: true, minLength: 3 },
      sku: { required: true, pattern: /^[A-Z0-9-]+$/ },
      price: { required: true, min: 0 },
    },
    onSubmit: async (data) => {
      // Custom Submit-Logik
    },
  },
};
```

---

### Best Practices für Customization

1. **Separation of Concerns**: Custom Code in eigene Ordner (`custom-layouts/`, `custom-renderers/`)
2. **Registry Pattern**: Zentrale Registries für einfache Erweiterbarkeit
3. **TypeScript nutzen**: Props-Interfaces für alle Custom Components
4. **Fallback-Logik**: Immer Standard-Verhalten als Fallback
5. **Testing**: Custom Components separat testen
6. **Dokumentation**: Eigene Anpassungen dokumentieren

---

## Contributing

### Workflow

1. Fork erstellen
2. Feature Branch: `git checkout -b feature/my-feature`
3. Änderungen committen
4. Push: `git push origin feature/my-feature`
5. Pull Request erstellen

### CLA

Alle Contributor müssen die [CLA](CLA.md) akzeptieren. Der GitHub Bot prüft dies automatisch bei jedem PR.

### Code Style

- TypeScript verwenden
- Funktionale Komponenten mit Hooks
- Aussagekräftige Variablen- und Funktionsnamen
- Komponenten in eigene Dateien auslagern

---

## Lizenz

**Pimcore Voyager License (PVL)**

| Nutzung | Lizenz |
|---------|--------|
| Offizielle App aus App Store / Google Play | **Kostenlos** |
| Geforkte oder angepasste Versionen | **Kostenpflichtig** via [store.pimcore.com](https://store.pimcore.com) |

Siehe [LICENSE.md](LICENSE.md) für vollständige Lizenzbedingungen.

---

**CORS GmbH**
Zeileisstraße 6, 4600 Wels, Austria
https://www.cors.gmbh

© 2025 CORS GmbH. Alle Rechte vorbehalten.
