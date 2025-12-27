# Data Type Implementation Guide

Dieser Leitfaden beschreibt, wie Pimcore Data Object Types in der Pimcore Voyager App implementiert werden.

## Übersicht

Pimcore unterstützt über 70 verschiedene Data Object Types. Jeder Type benötigt:
1. **Display Component** - Zeigt den Wert an (Read-Only)
2. **Edit Component** - Ermöglicht Bearbeitung
3. **Validator** - Validiert Eingaben
4. **Transformer** - Konvertiert zwischen API und UI Format

## Implementierungs-Template

### 1. Type Definition erstellen

Erstelle eine neue Datei für deinen Type:

```
src/
  components/
    dataTypes/
      [TypeName]/
        ├── index.ts                    # Exports
        ├── [TypeName]Display.tsx       # Display Component
        ├── [TypeName]Edit.tsx          # Edit Component
        ├── [TypeName].validator.ts     # Validation Logic
        ├── [TypeName].transformer.ts   # Data Transformation
        ├── [TypeName].types.ts         # TypeScript Definitionen
        └── [TypeName].test.tsx         # Tests
```

### 2. Display Component

```typescript
// src/components/dataTypes/Input/InputDisplay.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DataTypeDisplayProps } from '../types';

export const InputDisplay: React.FC<DataTypeDisplayProps> = ({ 
  value, 
  config 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{config.label}</Text>
      <Text style={styles.value}>{value || '-'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
});
```

### 3. Edit Component

```typescript
// src/components/dataTypes/Input/InputEdit.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import { DataTypeEditProps } from '../types';

export const InputEdit: React.FC<DataTypeEditProps> = ({ 
  value, 
  onChange, 
  config,
  error,
  readonly 
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{config.label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value || ''}
        onChangeText={onChange}
        placeholder={config.placeholder}
        editable={!readonly}
        maxLength={config.maxLength}
      />
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  inputError: {
    borderColor: '#e53e3e',
  },
  error: {
    color: '#e53e3e',
    fontSize: 12,
    marginTop: 4,
  },
});
```

### 4. Validator

```typescript
// src/components/dataTypes/Input/Input.validator.ts
import { ValidationResult } from '../types';

export interface InputConfig {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export function validateInput(
  value: string, 
  config: InputConfig
): ValidationResult {
  const errors: string[] = [];

  // Required validation
  if (config.required && (!value || value.trim() === '')) {
    errors.push('Dieses Feld ist erforderlich');
  }

  // Min length validation
  if (value && config.minLength && value.length < config.minLength) {
    errors.push(`Mindestens ${config.minLength} Zeichen erforderlich`);
  }

  // Max length validation
  if (value && config.maxLength && value.length > config.maxLength) {
    errors.push(`Maximal ${config.maxLength} Zeichen erlaubt`);
  }

  // Pattern validation
  if (value && config.pattern) {
    const regex = new RegExp(config.pattern);
    if (!regex.test(value)) {
      errors.push('Ungültiges Format');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
```

### 5. Transformer

```typescript
// src/components/dataTypes/Input/Input.transformer.ts

export const InputTransformer = {
  // Transform from Pimcore API format to UI format
  fromAPI: (apiValue: any): string => {
    if (apiValue === null || apiValue === undefined) {
      return '';
    }
    return String(apiValue);
  },

  // Transform from UI format to Pimcore API format
  toAPI: (uiValue: string): any => {
    if (uiValue === '' || uiValue === null || uiValue === undefined) {
      return null;
    }
    return uiValue;
  },
};
```

### 6. Type Definitions

```typescript
// src/components/dataTypes/Input/Input.types.ts

export interface InputValue {
  value: string;
}

export interface InputConfig {
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  defaultValue?: string;
}
```

### 7. Index/Exports

```typescript
// src/components/dataTypes/Input/index.ts
export { InputDisplay } from './InputDisplay';
export { InputEdit } from './InputEdit';
export { validateInput } from './Input.validator';
export { InputTransformer } from './Input.transformer';
export * from './Input.types';
```

### 8. Registry Registration

```typescript
// src/components/dataTypes/registry.ts
import { InputDisplay, InputEdit, validateInput, InputTransformer } from './Input';

export const dataTypeRegistry = {
  'input': {
    display: InputDisplay,
    edit: InputEdit,
    validator: validateInput,
    transformer: InputTransformer,
  },
  // ... weitere Typen
};
```

## Type-spezifische Guidelines

### Text/Numeric Types
- Input, Textarea, Numeric, Password, Email
- **Display**: Einfache Text-Anzeige
- **Edit**: TextInput mit entsprechendem Keyboard
- **Validation**: Pattern, Length, Required

### Boolean/Selection Types
- Checkbox, Select, Multiselect
- **Display**: Label + ausgewählte Werte
- **Edit**: Native Picker oder Custom Dropdown
- **Mobile**: Touch-optimierte Auswahl

### Date/Time Types
- Date, DateTime, Time
- **Display**: Formatiertes Datum/Zeit
- **Edit**: Native DatePicker (iOS/Android unterschiedlich!)
- **Timezone**: UTC speichern, local anzeigen

### Geographic Types
- Geopoint, Geobounds, Geopolygon
- **Display**: Karte mit Marker/Shape (react-native-maps)
- **Edit**: Interaktive Karte mit Touch-Controls
- **Performance**: Lazy Load für Maps

### Media Types
- Image, Video, Image Gallery
- **Display**: Thumbnail mit Preview-Option
- **Edit**: Upload-Button + Gallery Picker
- **Performance**: Progressive Loading, Compression

### Relation Types
- Many-to-One, Many-to-Many, etc.
- **Display**: Liste verknüpfter Objekte
- **Edit**: Searchable Picker mit Autocomplete
- **Performance**: Lazy Loading, Pagination
- **Implementiert**: ✅ Many-to-Many Object Relation
  - Siehe [MANY_TO_MANY_RELATION_USAGE.md](MANY_TO_MANY_RELATION_USAGE.md) für Details
  - Komponenten: Display, Edit, Validator, Transformer
  - Features: Search, Filter, Class Validation

### Structured Types
- Table, Fieldcollections, Block
- **Display**: Nested Components
- **Edit**: Add/Remove/Reorder UI
- **Challenge**: Komplexe UI auf kleinem Screen

## Testing Checklist

Für jeden implementierten Type:

- [ ] Display zeigt Wert korrekt an
- [ ] Edit erlaubt Eingabe/Änderung
- [ ] Validation funktioniert
- [ ] API Transform funktioniert (fromAPI/toAPI)
- [ ] Readonly Mode funktioniert
- [ ] Error States werden angezeigt
- [ ] Touch-Interaktionen sind flüssig
- [ ] Keyboard-Handling ist korrekt (iOS/Android)
- [ ] Performance ist akzeptabel
- [ ] Accessibility ist berücksichtigt
- [ ] Tests sind geschrieben

## Beispiel Test

```typescript
// src/components/dataTypes/Input/Input.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { InputEdit } from './InputEdit';
import { validateInput } from './Input.validator';

describe('Input DataType', () => {
  describe('Display', () => {
    it('should show value', () => {
      const { getByText } = render(
        <InputDisplay 
          value="Test Value" 
          config={{ label: 'Name' }} 
        />
      );
      expect(getByText('Test Value')).toBeTruthy();
    });
  });

  describe('Edit', () => {
    it('should call onChange on text change', () => {
      const onChange = jest.fn();
      const { getByPlaceholderText } = render(
        <InputEdit
          value=""
          onChange={onChange}
          config={{ label: 'Name', placeholder: 'Enter name' }}
        />
      );
      
      const input = getByPlaceholderText('Enter name');
      fireEvent.changeText(input, 'New Value');
      
      expect(onChange).toHaveBeenCalledWith('New Value');
    });

    it('should show error message', () => {
      const { getByText } = render(
        <InputEdit
          value=""
          onChange={() => {}}
          config={{ label: 'Name' }}
          error="Required field"
        />
      );
      
      expect(getByText('Required field')).toBeTruthy();
    });
  });

  describe('Validator', () => {
    it('should validate required field', () => {
      const result = validateInput('', { required: true });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Dieses Feld ist erforderlich');
    });

    it('should validate min length', () => {
      const result = validateInput('ab', { minLength: 3 });
      expect(result.valid).toBe(false);
    });
  });
});
```

## Referenzen

Für jeden Data Type gibt es eine Referenz-Implementierung im Pimcore Studio UI:

**Base URL**: `https://github.com/pimcore/studio-ui-bundle/blob/1.x/assets/js/src/core/modules/element/dynamic-types/definitions/objects/data-related/types/`

**Beispiele**:
- Input: `dynamic-type-object-data-input.tsx`
- Select: `dynamic-type-object-data-select.tsx`
- Date: `dynamic-type-object-data-date.tsx`

## Best Practices

1. **Mobile First**: Immer mit Touch-Interaktion im Kopf entwickeln
2. **Performance**: Lazy Loading, Memoization, Virtualization
3. **Accessibility**: Labels, Hints, Screen Reader Support
4. **Error Handling**: Klare Error Messages, Recovery Options
5. **Offline**: Optimistic Updates, Queue Changes
6. **Testing**: Unit + Integration Tests
7. **Documentation**: JSDoc Comments, README updates

## Häufige Fallstricke

- **iOS vs Android**: Native Components unterscheiden sich
- **Keyboard**: Auto-Focus und Dismiss handling
- **Layout**: SafeArea, Keyboard Avoiding View
- **State**: Don't mutate props, use controlled components
- **Performance**: Re-renders vermeiden mit React.memo
- **Validation**: Client-side ist nicht genug, Server validiert final
