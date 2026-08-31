# Data Type Implementation Guide

This guide describes how Pimcore Data Object Types are implemented in the Pimcore Voyager app.

## Overview

Pimcore supports over 70 different Data Object Types. Each type requires:
1. **Display Component** - Displays the value (read-only)
2. **Edit Component** - Enables editing
3. **Validator** - Validates input
4. **Transformer** - Converts between API and UI format

## Implementation Template

### 1. Create Type Definition

Create a new file for your type:

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
        ├── [TypeName].types.ts         # TypeScript definitions
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
  // ... more types
};
```

## Type-Specific Guidelines

### Text/Numeric Types
- Input, Textarea, Numeric, Password, Email
- **Display**: Simple text display
- **Edit**: TextInput with the appropriate keyboard
- **Validation**: Pattern, Length, Required

### Boolean/Selection Types
- Checkbox, Select, Multiselect
- **Display**: Label + selected values
- **Edit**: Native picker or custom dropdown
- **Mobile**: Touch-optimized selection

### Date/Time Types
- Date, DateTime, Time
- **Display**: Formatted date/time
- **Edit**: Native DatePicker (differs between iOS and Android!)
- **Timezone**: Store in UTC, display in local time

### Geographic Types
- Geopoint, Geobounds, Geopolygon
- **Display**: Map with marker/shape (react-native-maps)
- **Edit**: Interactive map with touch controls
- **Performance**: Lazy load for maps

### Media Types
- Image, Video, Image Gallery
- **Display**: Thumbnail with preview option
- **Edit**: Upload button + gallery picker
- **Performance**: Progressive loading, compression

### Relation Types
- Many-to-One, Many-to-Many, etc.
- **Display**: List of linked objects
- **Edit**: Searchable picker with autocomplete
- **Performance**: Lazy loading, pagination

### Structured Types
- Table, Fieldcollections, Block
- **Display**: Nested components
- **Edit**: Add/Remove/Reorder UI
- **Challenge**: Complex UI on a small screen

## Testing Checklist

For each implemented type:

- [ ] Display shows the value correctly
- [ ] Edit allows input/changes
- [ ] Validation works
- [ ] API transform works (fromAPI/toAPI)
- [ ] Readonly mode works
- [ ] Error states are displayed
- [ ] Touch interactions are smooth
- [ ] Keyboard handling is correct (iOS/Android)
- [ ] Performance is acceptable
- [ ] Accessibility is taken into account
- [ ] Tests are written

## Example Test

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

## References

For each data type there is a reference implementation in the Pimcore Studio UI:

**Base URL**: `https://github.com/pimcore/studio-ui-bundle/blob/1.x/assets/js/src/core/modules/element/dynamic-types/definitions/objects/data-related/types/`

**Examples**:
- Input: `dynamic-type-object-data-input.tsx`
- Select: `dynamic-type-object-data-select.tsx`
- Date: `dynamic-type-object-data-date.tsx`

## Best Practices

1. **Mobile First**: Always develop with touch interaction in mind
2. **Performance**: Lazy loading, memoization, virtualization
3. **Accessibility**: Labels, hints, screen reader support
4. **Error Handling**: Clear error messages, recovery options
5. **Offline**: Optimistic updates, queue changes
6. **Testing**: Unit + integration tests
7. **Documentation**: JSDoc comments, README updates

## Common Pitfalls

- **iOS vs Android**: Native components differ
- **Keyboard**: Auto-focus and dismiss handling
- **Layout**: SafeArea, Keyboard Avoiding View
- **State**: Don't mutate props, use controlled components
- **Performance**: Avoid re-renders with React.memo
- **Validation**: Client-side is not enough, the server validates finally
