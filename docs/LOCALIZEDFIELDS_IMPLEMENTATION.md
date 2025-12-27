# Localizedfields Data Type Implementation

## Overview

The Localizedfields data type allows you to manage content that varies by language/locale in Pimcore Data Objects. This implementation provides a mobile-optimized interface for displaying and editing localized content in the React Native app.

## Features

- ✅ **Multi-language Support**: Manage content in multiple languages (German, English, French, Italian by default)
- ✅ **Tab-based UI**: Easy language switching with visual tabs
- ✅ **Visual Indicators**: See which languages have data at a glance
- ✅ **Validation**: Built-in validation for mandatory fields
- ✅ **Mobile-optimized**: Touch-friendly interface designed for mobile devices
- ✅ **Type-safe**: Full TypeScript support with proper type definitions
- ✅ **Well-tested**: Comprehensive test suite with 19 passing tests

## Architecture

### Component Structure

```
src/components/dataTypes/Localizedfields/
├── index.ts                          # Main exports
├── Localizedfields.types.ts          # TypeScript type definitions
├── LocalizedfieldsDisplay.tsx        # Read-only display component
├── LocalizedfieldsEdit.tsx           # Editable form component
├── Localizedfields.transformer.ts    # API/UI data transformation
├── Localizedfields.validator.ts      # Validation logic
└── Localizedfields.test.tsx          # Unit tests
```

### Data Structure

Localizedfields data is stored in the following format:

```typescript
{
  [languageCode: string]: {
    [fieldName: string]: any
  }
}
```

Example:
```typescript
{
  de: {
    title: 'Deutscher Titel',
    description: 'Deutsche Beschreibung'
  },
  en: {
    title: 'English Title',
    description: 'English Description'
  }
}
```

## Usage

### Basic Display

Display localized content in read-only mode:

```tsx
import { LocalizedfieldsDisplay, LocalizedfieldsConfig, LocalizedValue } from '@/components/dataTypes/Localizedfields';

const config: LocalizedfieldsConfig = {
  name: 'content',
  title: 'Content',
  type: 'localizedfields',
  fieldDefinitions: [
    { name: 'title', title: 'Title', fieldtype: 'input' },
    { name: 'description', title: 'Description', fieldtype: 'textarea' }
  ]
};

const value: LocalizedValue = {
  de: { title: 'Titel', description: 'Beschreibung' },
  en: { title: 'Title', description: 'Description' }
};

<LocalizedfieldsDisplay value={value} config={config} />
```

### Editable Form

Create an editable form for localized content:

```tsx
import { LocalizedfieldsEdit } from '@/components/dataTypes/Localizedfields';

const [value, setValue] = useState<LocalizedValue>({
  de: { title: '', description: '' },
  en: { title: '', description: '' }
});

<LocalizedfieldsEdit
  value={value}
  onChange={setValue}
  config={config}
  error={errorMessage}
  readonly={false}
/>
```

### Using the Registry

Access Localizedfields through the data type registry:

```tsx
import { getDataType } from '@/components/dataTypes/registry';

const dataType = getDataType('localizedfields');
const DisplayComponent = dataType.display;
const EditComponent = dataType.edit;

<DisplayComponent value={value} config={config} />
<EditComponent value={value} onChange={setValue} config={config} />
```

### Validation

Validate localized data before submission:

```tsx
import { validateLocalizedfields } from '@/components/dataTypes/Localizedfields';

const validation = validateLocalizedfields(value, config);

if (!validation.valid) {
  console.error('Validation errors:', validation.errors);
  // validation.errors is an array of error messages
}
```

### Data Transformation

Transform data between API and UI formats:

```tsx
import { LocalizedfieldsTransformer } from '@/components/dataTypes/Localizedfields';

// From API to UI
const uiValue = LocalizedfieldsTransformer.fromAPI(apiResponse);

// From UI to API
const apiValue = LocalizedfieldsTransformer.toAPI(uiValue);
```

## Configuration

### LocalizedfieldsConfig

```typescript
interface LocalizedfieldsConfig {
  name: string;                              // Field name
  title: string;                             // Display title
  type: 'localizedfields';                   // Type identifier
  mandatory?: boolean;                       // Is field required?
  noteditable?: boolean;                     // Is field read-only?
  invisible?: boolean;                       // Hide field?
  fieldDefinitions?: LocalizedFieldDefinition[]; // Child field definitions
}
```

### LocalizedFieldDefinition

```typescript
interface LocalizedFieldDefinition {
  name: string;           // Field name
  title: string;          // Display title
  fieldtype: string;      // Field type (input, textarea, etc.)
  mandatory?: boolean;    // Is field required?
  noteditable?: boolean;  // Is field read-only?
  invisible?: boolean;    // Hide field?
}
```

## Component Props

### LocalizedfieldsDisplay

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| value | LocalizedValue | Yes | Localized data to display |
| config | LocalizedfieldsConfig | Yes | Field configuration |

### LocalizedfieldsEdit

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| value | LocalizedValue | Yes | Localized data to edit |
| onChange | (value: LocalizedValue) => void | Yes | Callback when value changes |
| config | LocalizedfieldsConfig | Yes | Field configuration |
| error | string | No | Error message to display |
| readonly | boolean | No | Make all fields read-only |

## Validation Rules

The validator checks:

1. **Mandatory Field**: If `config.mandatory` is true, at least one language must have data
2. **Mandatory Child Fields**: If a field in `fieldDefinitions` is mandatory, it must be filled in at least one language
3. **Non-empty Values**: Checks that values are not null, undefined, or empty strings

## Examples

See `src/components/examples/LocalizedfieldsExamples.tsx` for complete working examples:

1. **Basic Display**: Show localized content with language tabs
2. **Editable Form**: Edit localized content with validation
3. **Registry Usage**: Access component through the registry
4. **API Integration**: Load and save data with transformations

## Mobile UI Features

### Language Tabs
- Horizontal scrollable tab bar
- Active language highlighted in purple
- Visual indicator (green dot) for languages with data
- Touch-optimized tab size

### Display Mode
- Clean card-based layout
- Field labels with mandatory indicators
- Empty state message when no data
- Responsive to screen size

### Edit Mode
- Touch-friendly input fields
- Multi-line support for textarea fields
- Visual feedback for active inputs
- Error message display below form
- Read-only styling for disabled fields

## Testing

Run the test suite:

```bash
npm test -- Localizedfields.test.tsx
```

Test coverage includes:
- Display component rendering
- Edit component functionality
- Language switching
- Validation logic
- Data transformation
- Error handling
- Read-only mode

All 19 tests pass successfully.

## Future Enhancements

Potential improvements for future versions:

1. **Dynamic Language Configuration**: Load available languages from Pimcore API
2. **Field Type Delegation**: Support all Pimcore field types within localized fields
3. **Rich Text Editor**: Better support for WYSIWYG fields
4. **Inline Editing**: Edit fields directly in display mode
5. **Language Fallback**: Show fallback language when data is missing
6. **Language Search**: Filter/search through languages
7. **Copy Between Languages**: Copy content from one language to another
8. **Translation Integration**: Integration with translation services

## Related Documentation

- [Data Type Implementation Guide](../../docs/DATA_TYPE_IMPLEMENTATION.md)
- [Architecture Overview](../../docs/ARCHITECTURE.md)
- [Project Structure](../../docs/PROJECT_STRUCTURE.md)

## Support

For questions or issues related to the Localizedfields implementation:
1. Check the examples in `LocalizedfieldsExamples.tsx`
2. Review the test cases in `Localizedfields.test.tsx`
3. Refer to the Pimcore documentation for API details
4. Open an issue on GitHub

## License

This implementation is part of the Pimcore Voyager project and is licensed under GPL-3.0.
