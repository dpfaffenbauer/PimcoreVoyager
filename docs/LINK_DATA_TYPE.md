# Link Data Type Implementation

## Overview

The Link data type allows users to create and manage links in Pimcore Data Objects. It supports both direct URLs and internal object references, making it flexible for various use cases.

## Features

- ✅ **Direct URLs**: Support for external links with full URL
- ✅ **Internal Links**: References to internal Pimcore objects (documents, assets, data objects)
- ✅ **Rich Metadata**: Support for target, title, anchor, parameters, rel attributes, etc.
- ✅ **Validation**: Configurable required fields and URL format validation
- ✅ **Display Mode**: Read-only display with clickable links and metadata preview
- ✅ **Edit Mode**: Full-featured form for creating and editing links
- ✅ **Inherited Fields**: Visual indication for inherited values
- ✅ **API Transformation**: Seamless conversion between API and UI formats

## Components

### LinkDisplay

Displays a link in read-only mode.

**Props:**
- `value: LinkValue | null` - The link value to display
- `config: LinkConfig` - Configuration for the field
- `inherited?: boolean` - Whether the value is inherited
- `textPrefix?: string` - Prefix text to display before the link
- `textSuffix?: string` - Suffix text to display after the link

**Features:**
- Shows link type (Direct/Internal) with colored badges
- Displays inherited status when applicable
- Clickable direct URLs that open in browser
- Shows additional metadata (target, title)
- Handles empty/null values gracefully

### LinkEdit

Allows editing of a link.

**Props:**
- `value: LinkValue | null` - Current link value
- `onChange: (value: LinkValue | null) => void` - Callback when value changes
- `config: LinkConfig` - Configuration for the field
- `error?: string` - Error message to display
- `readonly?: boolean` - Whether the field is read-only

**Features:**
- Segmented control for link type selection (Direct/Internal)
- Direct URL input with keyboard type optimization
- Internal object selection (placeholder for future implementation)
- Advanced options: target, title, anchor, parameters, rel
- Respects disabled fields configuration
- Clear button to reset the link
- Validation feedback

## Types

### LinkValue

```typescript
interface LinkValue {
  text: string;                    // Display text for the link
  linktype: 'direct' | 'internal'; // Type of link
  direct?: string | null;          // Direct URL (for direct links)
  internal?: number | null;        // Internal object ID (for internal links)
  internalType?: string | null;    // Type of internal object
  fullPath?: string;               // Full path to internal object
  target: string | null;           // Link target (_blank, _self, etc.)
  parameters: string;              // URL parameters
  anchor: string;                  // Anchor/fragment identifier
  title: string;                   // Link title attribute
  accesskey: string;               // Access key
  rel: string;                     // Rel attribute
  tabindex: string;                // Tab index
  class: string;                   // CSS class
}
```

### LinkConfig

```typescript
interface LinkConfig {
  label: string;                   // Field label
  allowedTypes?: string[] | null;  // Allowed link types
  allowedTargets?: string[] | null; // Allowed target values
  disabledFields?: string[] | null; // Fields to disable
  required?: boolean;              // Whether field is required
  noteditable?: boolean;           // Whether field is editable
}
```

## Validator

The `validateLink` function validates link values based on configuration:

```typescript
validateLink(value: LinkValue | null, config: LinkConfig): ValidationResult
```

**Validation Rules:**
- Required field validation
- Direct URL format validation
- Internal object selection validation
- Allowed types validation

## Transformer

The `LinkTransformer` handles conversion between API and UI formats:

```typescript
LinkTransformer.fromAPI(apiValue: any): LinkValue | null
LinkTransformer.toAPI(uiValue: LinkValue | null): any
```

**Features:**
- Null value handling
- Default value population
- Clean API output (excludes empty optional fields)

## Usage

### Basic Display

```typescript
import { LinkDisplay } from '@/components/dataTypes/Link';

<LinkDisplay
  value={{
    text: 'Example',
    linktype: 'direct',
    direct: 'https://example.com',
    // ... other fields
  }}
  config={{ label: 'Website' }}
/>
```

### Basic Edit

```typescript
import { LinkEdit } from '@/components/dataTypes/Link';

const [link, setLink] = useState<LinkValue | null>(null);

<LinkEdit
  value={link}
  onChange={setLink}
  config={{ label: 'Website', required: true }}
/>
```

### With Validation

```typescript
import { validateLink } from '@/components/dataTypes/Link';

const result = validateLink(link, { label: 'Website', required: true });
if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

### With Transformation

```typescript
import { LinkTransformer } from '@/components/dataTypes/Link';

// From API
const uiValue = LinkTransformer.fromAPI(apiResponse);

// To API
const apiValue = LinkTransformer.toAPI(linkValue);
```

## Registry Integration

The Link type is registered in the data type registry:

```typescript
import { dataTypeRegistry } from '@/components/dataTypes/registry';

const linkType = dataTypeRegistry['link'];
const DisplayComponent = linkType.display;
const EditComponent = linkType.edit;
const validator = linkType.validator;
const transformer = linkType.transformer;
```

## Testing

The Link type includes comprehensive tests:

```bash
npm test -- Link.test.ts
```

**Test Coverage:**
- Validator tests for all validation rules
- Transformer tests for API/UI conversion
- Component rendering tests (TODO)
- Integration tests (TODO)

## Future Enhancements

- [ ] Object selection modal for internal links
- [ ] Link preview/validation
- [ ] URL shortening support
- [ ] QR code generation
- [ ] Analytics tracking parameters
- [ ] Link health checking
- [ ] Bulk link operations

## Reference

This implementation is based on the Pimcore Studio UI Bundle:
https://github.com/pimcore/studio-ui-bundle/blob/1.x/assets/js/src/core/modules/element/dynamic-types/definitions/objects/data-related/types/dynamic-type-object-data-link.tsx

## Demo

A demo screen is available at `src/screens/LinkDemoScreen.tsx` that showcases all features of the Link data type.
