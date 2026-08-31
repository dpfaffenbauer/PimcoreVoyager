# Pimcore Voyager - Architecture

## Overview

Pimcore Voyager is a React Native/Expo mobile app that serves as a generic companion app for Pimcore. The app makes it possible to view and edit Pimcore Data Objects on mobile devices.

## Technology Stack

### Frontend
- **React Native** - Cross-platform mobile framework
- **Expo** - Build and development tooling
- **TypeScript** - Type safety
- **React Navigation** - Navigation
- **React Hook Form** - Form management
- **React Query** - Server state management
- **Zustand/Redux** - Client state management

### Backend Integration
- **Pimcore REST API** - Data retrieval and manipulation
- **Pimcore GraphQL API** - Flexible data queries
- **OAuth2/JWT** - Authentication

## Architecture Principles

### 1. Dynamic Type System

The app uses a dynamic type system that interprets Pimcore class definitions at runtime:

```
Pimcore Class Definition → Type Registry → Component Rendering
```

**Benefits:**
- No code changes required for Pimcore schema updates
- Automatic UI generation
- Consistency with the Pimcore backend

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

## Core Components

### Data Type Registry

Central registry for all Pimcore Data Object types:

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
  // ... 69+ more types
};
```

### Dynamic Form Renderer

Generates forms based on class definitions:

```typescript
interface ClassDefinition {
  fields: FieldDefinition[];
  layout: LayoutDefinition;
}

function DynamicForm({ classDefinition, data, onSubmit }) {
  // Renders the form based on the definition
  // Uses the registry for type-specific components
}
```

### API Client

Abstracts Pimcore API access:

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
- API data (Data Objects, class definitions)
- Caching and invalidation
- Optimistic updates
- Offline queue

### Client State (Zustand/Redux)
- Authentication status
- UI state (navigation, modals, etc.)
- Form state (drafts, unsaved changes)
- User preferences

## Data Flow

### Displaying a Data Object

```
1. User navigates to Object Detail
2. Screen loads the class definition (cached)
3. Screen loads the object data via API
4. DynamicForm renders based on the class definition
5. For each field: registry lookup → component render
```

### Editing a Data Object

```
1. User opens edit mode
2. Form is initialized with the current values
3. User changes fields → local state update
4. Validation runs on every change
5. User saves → API call with transformed data
6. Success → cache invalidation & navigation
7. Error → error display & retry option
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

**Implementation:**
- Local storage for the change queue
- Background sync on reconnect
- Conflict resolution for data inconsistencies
- Optimistic UI updates

## Security

### Authentication
- OAuth2 / JWT token-based auth
- Secure token storage (Keychain/Keystore)
- Auto token refresh
- Biometric auth option

### Authorization
- Field-level permissions from Pimcore
- Read-only mode for restricted users
- Sensitive data handling

### Data Security
- HTTPS for all API calls
- No logging of sensitive data
- Encryption for local storage

## Performance Optimizations

### Rendering
- React.memo for static components
- Virtualized lists for long lists
- Lazy loading for images
- Code splitting for data types

### Network
- Request deduplication
- Aggressive caching
- Batch requests where possible
- Image optimization/thumbnails

### Startup
- Lazy component loading
- Progressive data loading
- Skeleton screens

## Testing Strategy

### Unit Tests
- Data type components (display/edit)
- Validators
- Transformers
- Utils

### Integration Tests
- Form rendering
- API client
- State management

### E2E Tests
- Login flow
- Object list → detail → edit → save
- Offline → online sync
- Error handling

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
- **Android**: APK via GitHub Releases or Google Play
- **iOS**: TestFlight or App Store
- **OTA Updates**: Expo Updates for fast patches

## Monitoring & Analytics

- Crash reporting (Sentry)
- Performance monitoring
- User analytics (opt-in)
- API error tracking

## Future Enhancements

- Push notifications
- Asset preview & editing
- Workflow integration
- Multi-language support
- Dark mode
- Advanced search/filtering
- Batch operations
- Export functions
