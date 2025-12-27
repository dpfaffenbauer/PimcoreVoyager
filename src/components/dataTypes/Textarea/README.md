# Textarea Data Type

Implementation of the Pimcore Data Object Type "Textarea" for the React Native mobile app.

## Overview

The Textarea component provides display and edit functionality for multiline text fields in Pimcore Data Objects. It is optimized for mobile touch interaction and supports validation, character counting, and formatting.

## Components

### TextareaDisplay
Read-only display component for textarea values.

**Props:**
- `value: string` - The textarea content to display
- `config: TextareaConfig` - Configuration object with display settings

**Features:**
- Displays label with optional required indicator
- Shows value in a card-styled container
- Displays placeholder "-" for empty values
- Theme-aware styling

### TextareaEdit
Interactive edit component for textarea input.

**Props:**
- `value: string` - Current textarea value
- `onChange: (value: string) => void` - Callback when value changes
- `config: TextareaConfig` - Configuration object
- `error?: string` - Optional error message to display
- `readonly?: boolean` - If true, disables editing

**Features:**
- Multiline text input optimized for mobile
- Character counter (when maxLength is set)
- Auto-adjusting height based on content
- Touch-optimized input area
- Validation error display
- Read-only mode support
- Platform-specific keyboard handling (iOS/Android)

## Configuration

```typescript
interface TextareaConfig {
  label: string;           // Field label
  placeholder?: string;    // Placeholder text
  required?: boolean;      // If true, field is mandatory
  minLength?: number;      // Minimum character length
  maxLength?: number;      // Maximum character length
  defaultValue?: string;   // Default value
  rows?: number;          // Number of visible rows (default: 4)
  readonly?: boolean;     // If true, field is read-only
  width?: number;         // Field width (not used in mobile)
  height?: number;        // Field height in pixels
}
```

## Validation

The `validateTextarea` function validates textarea input based on configuration:

- **Required**: Validates that field is not empty when required
- **Min Length**: Ensures minimum character count
- **Max Length**: Ensures maximum character count

```typescript
import { validateTextarea } from './Textarea.validator';

const result = validateTextarea(value, config);
if (!result.valid) {
  console.log(result.errors); // Array of error messages
}
```

## Data Transformation

The `TextareaTransformer` handles conversion between API and UI formats:

```typescript
import { TextareaTransformer } from './Textarea.transformer';

// API to UI
const uiValue = TextareaTransformer.fromAPI(apiValue);

// UI to API
const apiValue = TextareaTransformer.toAPI(uiValue);
```

**Transformation Rules:**
- Empty strings are converted to `null` for API
- `null` and `undefined` from API become empty strings in UI
- All values are converted to strings

## Usage Example

```tsx
import { TextareaEdit, TextareaDisplay } from './components/dataTypes/Textarea';

// Display mode
<TextareaDisplay
  value="Sample description text"
  config={{
    label: 'Description',
    required: true,
  }}
/>

// Edit mode
<TextareaEdit
  value={description}
  onChange={setDescription}
  config={{
    label: 'Description',
    placeholder: 'Enter description...',
    required: true,
    maxLength: 500,
    rows: 6,
  }}
  error={validationError}
/>
```

## Mobile Optimizations

- **Touch-optimized input area**: Large tap targets and appropriate sizing
- **Auto-correct and auto-capitalize**: Enabled for natural text entry
- **Platform-specific keyboard**: Appropriate keyboard type for iOS and Android
- **Scroll support**: Enables scrolling within textarea on iOS
- **Character counter**: Real-time feedback on character count
- **Validation feedback**: Clear error messages below input

## Testing

Tests are provided in `Textarea.test.tsx` and cover:
- Display component rendering
- Edit component interaction
- Validation logic
- Data transformation
- Character counting
- Error display
- Read-only mode

Run tests with:
```bash
npm test -- src/components/dataTypes/Textarea/Textarea.test.tsx
```

## Reference

Based on Pimcore Studio UI implementation:
https://github.com/pimcore/studio-ui-bundle/blob/1.x/assets/js/src/core/modules/element/dynamic-types/definitions/objects/data-related/types/dynamic-type-object-data-textarea.tsx
