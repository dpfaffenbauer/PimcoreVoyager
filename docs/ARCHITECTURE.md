# Pimcore Voyager - Architektur

## Übersicht

Pimcore Voyager ist eine React Native/Expo Mobile App, die als generische Companion App für Pimcore dient. Die App ermöglicht das Anzeigen und Bearbeiten von Pimcore Data Objects auf mobilen Geräten.

## Technologie-Stack

### Frontend
- **React Native** - Cross-platform Mobile Framework
- **Expo** - Build- und Development-Tooling
- **TypeScript** - Type Safety
- **React Navigation** - Navigation
- **React Hook Form** - Formular-Management
- **React Query** - Server State Management
- **Zustand/Redux** - Client State Management

### Backend Integration
- **Pimcore REST API** - Datenabruf und -manipulation
- **Pimcore GraphQL API** - Flexible Datenabfragen
- **OAuth2/JWT** - Authentifizierung

## Architektur-Prinzipien

### 1. Dynamic Type System

Die App nutzt ein dynamisches Typsystem, das Pimcore Class Definitions zur Laufzeit interpretiert:

```
Pimcore Class Definition → Type Registry → Component Rendering
```

**Vorteile:**
- Keine Code-Änderungen bei Pimcore-Schema-Updates
- Automatische UI-Generierung
- Konsistenz mit Pimcore-Backend

### 2. Component-Based Architecture

```
Screen
  ├── DataObjectList
  │   └── DataObjectCard
  └── DataObjectDetail
      └── DynamicForm
          ├── FieldRenderer
          │   └── DataTypeComponent (Input, Select, etc.)
          └── ValidationHandler
```

### 3. Layer Architecture

```
┌─────────────────────────────────┐
│   Presentation Layer            │
│   (React Native Components)     │
├─────────────────────────────────┤
│   Business Logic Layer          │
│   (Hooks, Services, Utils)      │
├─────────────────────────────────┤
│   Data Layer                    │
│   (API Client, State Mgmt)      │
├─────────────────────────────────┤
│   Pimcore Backend               │
│   (REST/GraphQL API)            │
└─────────────────────────────────┘
```

## Core Komponenten

### Data Type Registry

Zentrale Registry für alle Pimcore Data Object Types:

```typescript
interface DataTypeDefinition {
  display: React.ComponentType<DataTypeProps>;
  edit: React.ComponentType<DataTypeProps>;
  validator?: (value: any, config: any) => ValidationResult;
  transformer?: {
    toAPI: (value: any) => any;
    fromAPI: (value: any) => any;
  };
}

const registry: Record<string, DataTypeDefinition> = {
  'input': { ... },
  'textarea': { ... },
  'numeric': { ... },
  // ... 69+ weitere Typen
};
```

### Dynamic Form Renderer

Generiert Formulare basierend auf Class Definitions:

```typescript
interface ClassDefinition {
  fields: FieldDefinition[];
  layout: LayoutDefinition;
}

function DynamicForm({ classDefinition, data, onSubmit }) {
  // Rendert Formular basierend auf Definition
  // Nutzt Registry für Type-spezifische Components
}
```

### API Client

Abstrahiert Pimcore API Zugriffe:

```typescript
class PimcoreClient {
  // Authentication
  async login(credentials): Promise<AuthToken>
  async refreshToken(): Promise<AuthToken>
  
  // Data Objects
  async getClassDefinitions(): Promise<ClassDefinition[]>
  async listObjects(classId, filters): Promise<DataObject[]>
  async getObject(id): Promise<DataObject>
  async updateObject(id, data): Promise<DataObject>
  async createObject(classId, data): Promise<DataObject>
  
  // Assets
  async uploadAsset(file): Promise<Asset>
  async getAsset(id): Promise<Asset>
}
```

## State Management

### Server State (React Query)
- API-Daten (Data Objects, Class Definitions)
- Caching und Invalidierung
- Optimistic Updates
- Offline Queue

### Client State (Zustand/Redux)
- Authentifizierung Status
- UI State (Navigation, Modal, etc.)
- Form State (Draft, Unsaved Changes)
- User Preferences

## Data Flow

### Anzeigen eines Data Objects

```
1. User navigiert zu Object Detail
2. Screen lädt Class Definition (cached)
3. Screen lädt Object Daten via API
4. DynamicForm rendert basierend auf Class Def
5. Für jedes Feld: Registry lookup → Component render
```

### Bearbeiten eines Data Objects

```
1. User öffnet Edit Mode
2. Form wird mit aktuellen Werten initialisiert
3. User ändert Felder → Local State Update
4. Validation läuft bei jedem Change
5. User speichert → API Call mit transformierten Daten
6. Success → Cache Invalidierung & Navigation
7. Error → Error Anzeige & Retry Option
```

## Offline Support

```
┌──────────────┐
│  User Action │
└──────┬───────┘
       │
       ├─ Online  → Direct API Call
       │
       └─ Offline → Queue in Local Storage
                      │
                      └─ Background Sync when online
```

**Implementierung:**
- Local Storage für Änderungs-Queue
- Background Sync bei Reconnect
- Conflict Resolution bei Dateninkonsistenz
- Optimistic UI Updates

## Security

### Authentifizierung
- OAuth2 / JWT Token-based Auth
- Secure Token Storage (Keychain/Keystore)
- Auto Token Refresh
- Biometric Auth Option

### Autorisierung
- Field-Level Permissions aus Pimcore
- Read-Only Mode für eingeschränkte User
- Sensitive Data Handling

### Data Security
- HTTPS für alle API Calls
- No Logging of Sensitive Data
- Encryption for Local Storage

## Performance Optimierungen

### Rendering
- React.memo für statische Components
- Virtualized Lists für lange Listen
- Lazy Loading für Images
- Code Splitting für Data Types

### Netzwerk
- Request Deduplication
- Aggressive Caching
- Batch Requests wo möglich
- Image Optimization/Thumbnails

### Startup
- Lazy Component Loading
- Progressive Data Loading
- Skeleton Screens

## Testing Strategy

### Unit Tests
- Data Type Components (Display/Edit)
- Validators
- Transformers
- Utils

### Integration Tests
- Form Rendering
- API Client
- State Management

### E2E Tests
- Login Flow
- Object List → Detail → Edit → Save
- Offline → Online Sync
- Error Handling

## Build & Deployment

### Development
```bash
npm start           # Expo Dev Server
npm run ios         # iOS Simulator
npm run android     # Android Emulator
```

### Production Builds
```bash
# Android
eas build --platform android --profile production

# iOS  
eas build --platform ios --profile production
```

### Distribution
- **Android**: APK via GitHub Releases oder Google Play
- **iOS**: TestFlight oder App Store
- **OTA Updates**: Expo Updates für schnelle Patches

## Monitoring & Analytics

- Crash Reporting (Sentry)
- Performance Monitoring
- User Analytics (opt-in)
- API Error Tracking

## Zukünftige Erweiterungen

- Push Notifications
- Asset Preview & Editing
- Workflow Integration
- Multi-Language Support
- Dark Mode
- Advanced Search/Filtering
- Batch Operations
- Export Funktionen
