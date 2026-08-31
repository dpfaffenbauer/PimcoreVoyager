# Contributing to Pimcore Voyager

Welcome to Pimcore Voyager! This guide helps you get started with development.

## Development Environment Setup

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI
- For iOS: Xcode (macOS only)
- For Android: Android Studio

### Installation

```bash
# Clone the repository
git clone https://github.com/dpfaffenbauer/PimcoreVoyager.git
cd PimcoreVoyager

# Install dependencies
npm install

# Install Expo CLI (if not already installed)
npm install -g expo-cli

# Start the app
npm start
```

## Project Structure

```
PimcoreVoyager/
├── src/
│   ├── components/          # React Native components
│   │   ├── dataTypes/      # Data object type components
│   │   ├── forms/          # Form components
│   │   └── ui/             # Base UI components
│   ├── screens/            # App screens
│   ├── services/           # API services
│   │   └── pimcore/        # Pimcore API client
│   ├── store/              # State management (Redux/Zustand)
│   ├── types/              # TypeScript definitions
│   └── utils/              # Helper functions
├── assets/                 # Images, fonts, etc.
├── docs/                   # Documentation
└── __tests__/              # Tests
```

## Data Object Types Implementation

Each Pimcore data object type requires:

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
  // ... more types
};
```

## Coding Standards

### TypeScript

- Use TypeScript for all new files
- Define explicit types for props and state
- Avoid `any` where possible

### React Native Best Practices

- Use functional components with hooks
- Implement React.memo for performance-critical components
- Use StyleSheet.create for styles

### Mobile Optimization

- Touch targets at least 44x44 pixels
- Account for different screen sizes
- Test on iOS and Android
- Implement loading states
- Handle offline scenarios

## Testing

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Type check
npm run type-check

# Linting
npm run lint
```

### Test Structure for Data Types

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

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/input-type`)
3. Commit your changes (`git commit -am 'Add Input type implementation'`)
4. Push to the branch (`git push origin feature/input-type`)
5. Create a pull request

### PR Checklist

- [ ] Code follows the coding standards
- [ ] Tests are added/updated
- [ ] Documentation is updated
- [ ] Build runs without errors
- [ ] Mobile UX is tested (iOS & Android)

## References

- [Pimcore Studio UI Bundle](https://github.com/pimcore/studio-ui-bundle) - Reference implementation
- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [Pimcore API Documentation](https://pimcore.com/docs/)

## Questions?

If you have questions, create an issue or contact @dpfaffenbauer.
