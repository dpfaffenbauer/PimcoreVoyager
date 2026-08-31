# Pimcore Voyager - Developer Documentation

> **Last updated:** January 2025
> **Version:** 1.0.0

---

## Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Architecture](#architecture)
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

## Overview

Pimcore Voyager is a React Native/Expo mobile app for managing Pimcore content. The app communicates with the Pimcore Studio API and supports:

- **Data Objects**: Browse, view, workflow management
- **Assets**: Browse and view the media library
- **Documents**: Document tree and details
- **Search**: Global search across all content types
- **Multi-Instance**: Manage multiple Pimcore servers

### Tech Stack

| Technology | Version | Purpose |
|-------------|---------|------------|
| React Native | 0.81.5 | Mobile Framework |
| Expo | 54.x | Build & Dev Toolchain |
| TypeScript | 5.9.x | Type Safety |
| React Navigation | 7.x | Navigation |
| React Native Paper | 5.x | UI Components |
| Zustand | 5.x | State Management |
| Axios | 1.x | HTTP Client |

---

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Xcode 15+ (for iOS)
- Android Studio (for Android)
- Pimcore 11.x with Studio UI Bundle

### Installation

```bash
# Clone the repository
git clone https://github.com/cors-gmbh/pimcore-voyager.git
cd pimcore-voyager

# Install dependencies
npm install

# Install iOS pods (in case of CocoaPods issues)
cd ios && pod install && cd ..

# Start the development server
npm start
```

### Development Build

```bash
# iOS device (with dev client)
npx expo run:ios --device

# iOS simulator
npx expo run:ios

# Android
npx expo run:android

# Release build for iOS
npx expo run:ios --device --configuration Release
```

---

## Project Structure

```
pimcore-voyager/
├── src/
│   ├── apis/                      # API layer
│   │   ├── apiClient.ts           # Axios configuration
│   │   ├── authService.ts         # Authentication
│   │   ├── pimcoreService.ts      # Facade (re-exports all services)
│   │   ├── dataObjectService.ts   # Data object operations
│   │   ├── assetService.ts        # Asset operations
│   │   ├── documentService.ts     # Document operations
│   │   ├── classService.ts        # Class definitions
│   │   ├── workflowService.ts     # Workflow operations
│   │   └── searchService.ts       # Search functionality
│   │
│   ├── components/                # Reusable components
│   │   ├── FieldRenderer.tsx      # Dynamic field rendering
│   │   ├── WorkflowSection.tsx    # Workflow status display
│   │   ├── WorkflowActionDialog.tsx # Workflow action dialog
│   │   ├── CustomDrawer.tsx       # Navigation drawer
│   │   └── FloatingActionMenu.tsx # FAB menu
│   │
│   ├── screens/                   # Screen components
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
│   ├── navigation/                # Navigation configuration
│   │   └── AppNavigation.tsx
│   │
│   ├── store/                     # Zustand stores
│   │   ├── authStore.ts           # Auth state
│   │   ├── appStore.ts            # App state
│   │   └── instanceStore.ts       # Multi-instance state
│   │
│   ├── types/                     # TypeScript definitions
│   │   ├── pimcore.ts             # Pimcore types
│   │   ├── auth.ts                # Auth types
│   │   └── instance.ts            # Instance types
│   │
│   └── config/                    # Configuration
│       ├── env.ts                 # Environment
│       └── constants.ts           # Constants
│
├── assets/                        # Static assets
│   └── logo.png
│
├── ios/                           # Native iOS project
├── android/                       # Native Android project
│
├── .github/
│   └── workflows/
│       └── cla-check.yml          # CLA bot
│
├── App.tsx                        # Root component
├── app.json                       # Expo config
├── eas.json                       # EAS build config
├── package.json
├── tsconfig.json
├── LICENSE.md                     # PVL license
├── CLA.md                         # Contributor License Agreement
└── README.md
```

---

## Architecture

### Layered Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Screens                          │
│  (UI Layer - React Native Components)               │
├─────────────────────────────────────────────────────┤
│                   Components                        │
│  (Reusable UI building blocks)                      │
├─────────────────────────────────────────────────────┤
│                 State Management                    │
│  (Zustand Stores - authStore, appStore, etc.)       │
├─────────────────────────────────────────────────────┤
│                   API Services                      │
│  (DataObjectService, AssetService, etc.)            │
├─────────────────────────────────────────────────────┤
│                   API Client                        │
│  (Axios with interceptors)                          │
├─────────────────────────────────────────────────────┤
│              Pimcore Studio API                     │
│  (Backend)                                          │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
User Action → Screen → Store Action → API Service → Backend
                ↑                                      ↓
                └──────── State Update ←───────────────┘
```

---

## API Services

The API layer is built in a modular fashion. Each service is responsible for one area.

### Service Overview

| Service | File | Description |
|---------|-------|--------------|
| `PimcoreService` | `pimcoreService.ts` | Facade - re-exports all services |
| `DataObjectService` | `dataObjectService.ts` | Data object CRUD |
| `AssetService` | `assetService.ts` | Asset operations |
| `DocumentService` | `documentService.ts` | Document operations |
| `ClassService` | `classService.ts` | Class definitions & layouts |
| `WorkflowService` | `workflowService.ts` | Workflow status & actions |
| `SearchService` | `searchService.ts` | Global search |
| `AuthService` | `authService.ts` | Login/logout |

### DataObjectService

```typescript
// Load data objects
DataObjectService.getDataObjects(classId?, page?, limit?, parentId?)

// Load a single object
DataObjectService.getDataObject(id)

// Load an object with all field data
DataObjectService.getDataObjectFull(id)

// Load the layout/field structure
DataObjectService.getDataObjectLayout(id)

// Load the tree structure
DataObjectService.getTreeLevel(parentId)

// Grid data for folders
DataObjectService.getGridConfiguration(folderId, classId, page, limit)
```

### WorkflowService

```typescript
// Load workflow details (status, transitions, global actions)
WorkflowService.getWorkflowDetails(elementId, elementType)

// Execute a workflow action
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
// All class definitions
ClassService.getClassDefinitions()

// A single class definition
ClassService.getClassDefinition(classId)

// Classes in a folder
ClassService.getFolderClasses(folderId)

// Field collection layouts
ClassService.getFieldCollectionLayouts(objectId)

// Object brick layouts
ClassService.getObjectBrickLayouts(objectId)
```

### Usage

```typescript
// Option 1: Import individual services
import { DataObjectService, WorkflowService } from '../apis/pimcoreService';

// Option 2: Use the facade (backwards compatible)
import { PimcoreService } from '../apis/pimcoreService';
PimcoreService.getDataObject(123);
```

---

## Screens

### Screen Overview

| Screen | File | Description |
|--------|-------|--------------|
| `LoginScreen` | `LoginScreen.tsx` | User login |
| `InstanceSelectionScreen` | `InstanceSelectionScreen.tsx` | Select a Pimcore instance |
| `AddEditInstanceScreen` | `AddEditInstanceScreen.tsx` | Add/edit an instance |
| `DataObjectsScreen` | `DataObjectsScreen.tsx` | Data object tree |
| `ObjectListScreen` | `ObjectListScreen.tsx` | Object list for a class |
| `ObjectDetailScreen` | `ObjectDetailScreen.tsx` | Object details with fields |
| `FolderDetailScreen` | `FolderDetailScreen.tsx` | Folder contents with grid |
| `AssetsScreen` | `AssetsScreen.tsx` | Asset tree |
| `AssetDetailScreen` | `AssetDetailScreen.tsx` | Asset details |
| `DocumentsScreen` | `DocumentsScreen.tsx` | Document tree |
| `DocumentDetailScreen` | `DocumentDetailScreen.tsx` | Document details |
| `SearchScreen` | `SearchScreen.tsx` | Global search |
| `SettingsScreen` | `SettingsScreen.tsx` | App settings |

### ObjectDetailScreen Features

- Header with object metadata
- Tab navigation for layout panels
- Dynamic field rendering via `FieldRenderer`
- Workflow status display
- Menu with:
  - Workflow actions (transitions, global actions)
  - Object information
  - Permissions
- Pull-to-refresh

### FolderDetailScreen Features

- **Responsive split layout**: Adapts automatically based on screen width
  - **Tablet (> 768px)**: Side-by-side layout with the class sidebar on the left and the object list on the right
  - **Phone (≤ 768px)**: Stacked layout with a dropdown class selector
- Class selection per folder
- Grid view of the objects
- Pagination with "Load more"
- Pull-to-refresh

```typescript
// Breakpoint constant
const SPLIT_LAYOUT_BREAKPOINT = 768;

// Hook for responsive detection
const { width } = useWindowDimensions();
const isSplitLayout = width > SPLIT_LAYOUT_BREAKPOINT;
```

---

## Components

### FieldRenderer

Dynamic rendering of all Pimcore field types.

**Supported field types:**

| Category | Field types |
|-----------|-----------|
| Text | input, textarea, wysiwyg, password |
| Numeric | numeric, slider, quantityValue |
| Selection | select, multiselect, booleanSelect |
| Date/Time | date, datetime, time, dateRange |
| Relations | manyToOneRelation, manyToManyRelation, manyToManyObjectRelation |
| Structured | fieldcollections, objectbricks, block, classificationstore |
| Geo | geopoint, geobounds, geopolygon, geopolyline |
| Media | image, video, hotspotimage, imageGallery |
| Other | link, table, structuredTable, checkbox, rgbaColor |

**Usage:**

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

Displays workflow status badges for objects.

```tsx
import { WorkflowSection } from '../components/WorkflowSection';

<WorkflowSection workflows={workflowItems} />
```

**Props:**
- `workflows: WorkflowItem[]` - Array of workflow items

### WorkflowActionDialog

Modal dialog for workflow actions with support for comments and additional fields.

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
- `visible: boolean` - Dialog shown/hidden
- `title: string` - Title of the dialog
- `notes: WorkflowNotes` - Configuration for the comment and additional fields
- `loading?: boolean` - Loading state during execution
- `onCancel: () => void` - Callback on cancel
- `onSubmit: (data: WorkflowActionData) => void` - Callback on submit

**Supported field types:**

| Type | Description |
|-----|--------------|
| `input` | Single-line text field |
| `numeric` | Numeric input |
| `textarea` | Multi-line text field |
| `select` | Dropdown selection |
| `checkbox` | Checkbox |
| `date` | Date picker |
| `datetime` | Date + time |
| `user` | User ID input |

**Example API payload:**
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

### Usage

```typescript
import { useAuthStore } from '../store/authStore';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuthStore();

  // ...
}
```

---

## Navigation

### Navigation Structure

```
Root Navigator (Stack)
├── InstanceSelection (when no instance is selected)
├── Login (when not authenticated)
└── Main Navigator (Drawer)
    ├── Data Objects Stack
    │   ├── DataObjectsScreen (tree view)
    │   ├── ObjectListScreen (object list)
    │   ├── ObjectDetailScreen (object details)
    │   └── FolderDetailScreen (folder contents)
    ├── Assets Stack
    │   ├── AssetsScreen (tree view)
    │   └── AssetDetailScreen (asset details)
    ├── Documents Stack
    │   ├── DocumentsScreen (tree view)
    │   └── DocumentDetailScreen (document details)
    ├── Search Stack
    │   └── SearchScreen
    └── Settings Stack
        ├── SettingsScreen
        └── AddEditInstanceScreen
```

### Navigation Types

```typescript
// Defined in navigation/AppNavigation.tsx
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

### Base URL

```
https://your-pimcore.com/pimcore-studio/api
```

### Authentication

Session-based with cookies:

```typescript
// Login
POST /pimcore-studio/api/login
Body: { username, password }

// Logout
POST /pimcore-studio/api/logout
```

### Important Endpoints

#### Data Objects

```
GET  /data-objects/tree?parentId={id}      # Tree structure
GET  /data-objects/{id}                     # Single object
GET  /data-objects/{id}/layout              # Layout/field structure
POST /data-objects/grid/{classId}           # Grid data
```

#### Assets

```
GET  /assets/tree?parentId={id}             # Tree structure
GET  /assets/{id}                           # Single asset
```

#### Documents

```
GET  /documents/tree?parentId={id}          # Tree structure
GET  /documents/{id}                        # Single document
```

#### Workflows

```
GET  /workflows/details?elementId={id}&elementType={type}
POST /workflows/action
```

#### Classes

```
GET  /class/collection                      # All classes
GET  /class/definition/{classId}            # Single class
GET  /class/folder/{folderId}               # Classes in a folder
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
# iOS with dev client
npx expo run:ios --device

# Android
npx expo run:android --device
```

### Release Build (Local)

```bash
# iOS release
npx expo run:ios --device --configuration Release
```

### EAS Build (Cloud)

```bash
# Development
eas build --profile development --platform ios

# Preview (internal testing)
eas build --profile preview --platform ios

# Production
eas build --profile production --platform ios
```

### TestFlight Upload

1. Open Xcode:
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

### Build Profiles (eas.json)

| Profile | Purpose |
|--------|------------|
| `development` | Dev client with debug features |
| `preview` | Internal testing (APK/IPA) |
| `production` | App Store release |

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

### Unit Tests (if set up)

```bash
npm test
```

---

## Troubleshooting

### CocoaPods Issues

```bash
# In case of RVM/Ruby conflicts
env -u GEM_PATH -u GEM_HOME /opt/homebrew/bin/pod install

# Reinstall pods
cd ios && rm -rf Pods Podfile.lock && pod install
```

### iOS Build Errors

```bash
# Clean build
cd ios && xcodebuild clean && cd ..
npx expo prebuild --clean
```

### Metro Bundler Reset

```bash
npx expo start --clear
```

### Xcode Signing

1. Open Xcode
2. Select the "PimcoreVoyager" target
3. Signing & Capabilities
4. Select a team
5. Enable "Automatically manage signing"

### iOS Simulator Not Found

```bash
# List available simulators
xcrun simctl list devices available
```

---

## Customization

This section describes how the app can be adapted for specific use cases.

> **Note:** Customized/forked versions require a commercial license. See [LICENSE.md](LICENSE.md).

### Overview of Customization Options

| Customization | Difficulty | Description |
|-----------|---------------|--------------|
| Custom Detail Layouts | Medium | Custom layouts for specific classes |
| Custom Field Renderer | Medium | Custom renderers for special field types |
| Custom Screens | Advanced | Completely custom screens for classes |
| Custom Create Forms | Advanced | Custom forms for creating objects (planned) |
| Theming | Easy | Colors, fonts, branding |

---

### Custom Detail Layouts for Classes

You can create custom detail layouts for specific Pimcore classes.

#### Step 1: Create a Custom Layout Component

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

#### Step 2: Create a Layout Registry

```tsx
// src/config/customLayouts.ts

import { ProductDetailLayout } from '../components/custom-layouts/ProductDetailLayout';
import { CustomerDetailLayout } from '../components/custom-layouts/CustomerDetailLayout';

// Registry for custom layouts by class name
export const customDetailLayouts: Record<string, React.ComponentType<any>> = {
  'Product': ProductDetailLayout,
  'Customer': CustomerDetailLayout,
  // Add more classes here
};

// Helper function
export function getCustomLayout(className: string) {
  return customDetailLayouts[className] || null;
}
```

#### Step 3: Integrate into ObjectDetailScreen

```tsx
// In src/screens/ObjectDetailScreen.tsx

import { getCustomLayout } from '../config/customLayouts';

// In the component:
const CustomLayout = getCustomLayout(object.className);

// In the render:
{CustomLayout ? (
  <CustomLayout objectData={objectData.objectData} object={object} />
) : (
  // Default FieldRenderer layout
  <LayoutNodeRenderer ... />
)}
```

---

### Custom Field Renderer

For special field types or Pimcore plugins you can create your own renderers.

#### Step 1: Create a Custom Renderer

```tsx
// src/components/custom-renderers/ColorSwatchRenderer.tsx

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

interface ColorSwatchRendererProps {
  value: string; // HEX color
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

#### Step 2: Extend the Renderer Registry

```tsx
// src/config/customRenderers.ts

import { ColorSwatchRenderer } from '../components/custom-renderers/ColorSwatchRenderer';
import { RatingRenderer } from '../components/custom-renderers/RatingRenderer';

// Registry for custom renderers by field type
export const customFieldRenderers: Record<string, React.ComponentType<any>> = {
  'colorPicker': ColorSwatchRenderer,
  'rating': RatingRenderer,
  'customPlugin.specialField': MySpecialRenderer,
};

export function getCustomRenderer(fieldType: string) {
  return customFieldRenderers[fieldType] || null;
}
```

#### Step 3: Integrate into FieldRenderer

```tsx
// In src/components/FieldRenderer.tsx, in the renderField function:

import { getCustomRenderer } from '../config/customRenderers';

// At the beginning of renderField:
const CustomRenderer = getCustomRenderer(fieldDefinition.fieldtype);
if (CustomRenderer) {
  return <CustomRenderer value={value} fieldName={fieldName} title={fieldDefinition.title} />;
}

// Then the default rendering...
```

---

### Custom Screens for Classes

For complex use cases you can create completely custom screens.

#### Step 1: Create a Custom Screen

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

#### Step 2: Create a Screen Registry

```tsx
// src/config/customScreens.ts

import { OrderDetailScreen } from '../screens/custom/OrderDetailScreen';
import { CustomerDetailScreen } from '../screens/custom/CustomerDetailScreen';

// Registry for custom screens by class name
export const customDetailScreens: Record<string, React.ComponentType<any>> = {
  'Order': OrderDetailScreen,
  'Customer': CustomerDetailScreen,
};

export function getCustomScreen(className: string) {
  return customDetailScreens[className] || null;
}
```

#### Step 3: Adjust the Navigation

```tsx
// In src/navigation/AppNavigation.tsx

import { getCustomScreen } from '../config/customScreens';

// In DataObjectsStack, register custom screens dynamically:
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

#### Customize App-Wide Colors

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

1. Replace the logo: `assets/logo.png`
2. Splash screen: `app.json` → `splash` configuration
3. App icon: `app.json` → `icon` configuration

---

### Custom Create Forms (Planned)

> **Status:** In development

In the future it will be possible to define custom forms for creating objects:

```tsx
// Planned API (example)
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
      // Custom submit logic
    },
  },
};
```

---

### Best Practices for Customization

1. **Separation of concerns**: Put custom code in dedicated folders (`custom-layouts/`, `custom-renderers/`)
2. **Registry pattern**: Central registries for easy extensibility
3. **Use TypeScript**: Props interfaces for all custom components
4. **Fallback logic**: Always keep the default behavior as a fallback
5. **Testing**: Test custom components separately
6. **Documentation**: Document your own customizations

---

## Contributing

### Workflow

1. Create a fork
2. Feature branch: `git checkout -b feature/my-feature`
3. Commit your changes
4. Push: `git push origin feature/my-feature`
5. Create a pull request

### CLA

All contributors must accept the [CLA](CLA.md). The GitHub bot checks this automatically on every PR.

### Code Style

- Use TypeScript
- Functional components with hooks
- Meaningful variable and function names
- Extract components into their own files

---

## License

**Pimcore Voyager License (PVL)**

| Usage | License |
|---------|--------|
| Official app from the App Store / Google Play | **Free** |
| Forked or customized versions | **Paid** via [store.pimcore.com](https://store.pimcore.com) |

See [LICENSE.md](LICENSE.md) for the full license terms.

---

**CORS GmbH**
Zeileisstraße 6, 4600 Wels, Austria
https://www.cors.gmbh

© 2025 CORS GmbH. All rights reserved.
