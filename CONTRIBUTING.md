# Contributing to Pimcore Voyager

Willkommen bei Pimcore Voyager! Diese Anleitung hilft dir beim Einstieg in die Entwicklung.

## Entwicklungsumgebung Setup

### Voraussetzungen

- Node.js (v18 oder höher)
- npm oder yarn
- Expo CLI
- Für iOS: Xcode (nur macOS)
- Für Android: Android Studio

### Installation

```bash
# Repository klonen
git clone https://github.com/dpfaffenbauer/PimcoreVoyager.git
cd PimcoreVoyager

# Dependencies installieren
npm install

# Expo CLI installieren (falls nicht vorhanden)
npm install -g expo-cli

# App starten
npm start
```

## Projektstruktur

```
PimcoreVoyager/
├── src/
│   ├── components/          # React Native Komponenten
│   │   ├── dataTypes/      # Data Object Type Komponenten
│   │   ├── forms/          # Formular-Komponenten
│   │   └── ui/             # UI-Basis-Komponenten
│   ├── screens/            # App-Screens
│   ├── services/           # API Services
│   │   └── pimcore/        # Pimcore API Client
│   ├── store/              # State Management (Redux/Zustand)
│   ├── types/              # TypeScript Definitionen
│   └── utils/              # Hilfsfunktionen
├── assets/                 # Bilder, Fonts, etc.
├── docs/                   # Dokumentation
└── __tests__/              # Tests
```

## Data Object Types Implementierung

Jeder Pimcore Data Object Type benötigt:

### 1. Type Definition

```typescript
// src/types/dataTypes.ts
export interface DataTypeProps {
  value: any;
  onChange: (value: any) => void;
  config: DataTypeConfig;
  readonly?: boolean;
  error?: string;
}
```

### 2. Display Component

```typescript
// src/components/dataTypes/Input/InputDisplay.tsx
import React from 'react';
import { Text, View } from 'react-native';

export const InputDisplay: React.FC<DataTypeProps> = ({ value, config }) => {
  return (
    <View>
      <Text>{config.label}</Text>
      <Text>{value || '-'}</Text>
    </View>
  );
};
```

### 3. Edit Component

```typescript
// src/components/dataTypes/Input/InputEdit.tsx
import React from 'react';
import { TextInput, View } from 'react-native';

export const InputEdit: React.FC<DataTypeProps> = ({ 
  value, 
  onChange, 
  config,
  error 
}) => {
  return (
    <View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={config.placeholder}
      />
      {error && <Text>{error}</Text>}
    </View>
  );
};
```

### 4. Registration

```typescript
// src/components/dataTypes/registry.ts
import { InputDisplay, InputEdit } from './Input';

export const dataTypeRegistry = {
  'input': {
    display: InputDisplay,
    edit: InputEdit,
  },
  // ... weitere Typen
};
```

## Coding Standards

### TypeScript

- Verwende TypeScript für alle neuen Dateien
- Definiere explizite Types für Props und State
- Vermeide `any` wo möglich

### React Native Best Practices

- Nutze funktionale Komponenten mit Hooks
- Implementiere React.memo für Performance-kritische Komponenten
- Verwende StyleSheet.create für Styles

### Mobile Optimierung

- Touch-Targets mindestens 44x44 Pixel
- Berücksichtige verschiedene Bildschirmgrößen
- Teste auf iOS und Android
- Implementiere Loading States
- Handle Offline-Szenarien

## Testing

```bash
# Unit Tests
npm test

# E2E Tests
npm run test:e2e

# Type Check
npm run type-check

# Linting
npm run lint
```

### Test-Struktur für Data Types

```typescript
// __tests__/dataTypes/Input.test.tsx
describe('Input Data Type', () => {
  it('should display value correctly', () => {
    // Test display component
  });

  it('should handle edit interactions', () => {
    // Test edit component
  });

  it('should validate input', () => {
    // Test validation logic
  });
});
```

## Pull Request Prozess

1. Fork das Repository
2. Erstelle einen Feature Branch (`git checkout -b feature/input-type`)
3. Committe deine Änderungen (`git commit -am 'Add Input type implementation'`)
4. Push zum Branch (`git push origin feature/input-type`)
5. Erstelle einen Pull Request

### PR Checklist

- [ ] Code folgt den Coding Standards
- [ ] Tests sind hinzugefügt/aktualisiert
- [ ] Dokumentation ist aktualisiert
- [ ] Build läuft ohne Fehler
- [ ] Mobile UX ist getestet (iOS & Android)

## Referenzen

- [Pimcore Studio UI Bundle](https://github.com/pimcore/studio-ui-bundle) - Referenz-Implementierung
- [React Native Dokumentation](https://reactnative.dev/)
- [Expo Dokumentation](https://docs.expo.dev/)
- [Pimcore API Dokumentation](https://pimcore.com/docs/)

## Fragen?

Bei Fragen erstelle ein Issue oder kontaktiere @dpfaffenbauer.
