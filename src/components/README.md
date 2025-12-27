# Components

This directory contains reusable React Native components for the Pimcore Voyager app.

## Structure

```
components/
├── dataTypes/           # Pimcore Data Object Type Components
│   ├── common/          # Shared types and utilities
│   ├── Localizedfields/ # Localizedfields data type implementation
│   └── registry.ts      # Central data type registry
├── examples/            # Example/demo screens
└── index.ts            # Main exports
```

## Data Types

Data types are implementations of Pimcore Data Object field types. Each data type consists of:

- **Display Component**: Read-only view of the data
- **Edit Component**: Editable form for the data
- **Validator**: Validation logic for the field
- **Transformer**: Converts between API and UI formats
- **Types**: TypeScript type definitions

### Implemented Data Types

- ✅ **Localizedfields**: Multi-language field support with tab-based UI

### Usage

```tsx
import { getDataType } from '@/components/dataTypes';

const dataType = getDataType('localizedfields');
const DisplayComponent = dataType.display;
const EditComponent = dataType.edit;
```

See [DATA_TYPE_IMPLEMENTATION.md](../docs/DATA_TYPE_IMPLEMENTATION.md) for details on implementing new data types.

## Examples

Example screens demonstrating component usage are available in the `examples/` directory:

- `LocalizedfieldsExamples.tsx`: Complete examples for Localizedfields component

## Adding New Components

When adding new components:

1. Create a new directory for the component
2. Include proper TypeScript types
3. Add unit tests
4. Update this README
5. Add examples if applicable

## Testing

Run tests for all components:

```bash
npm test
```

Run tests for specific component:

```bash
npm test -- Localizedfields.test.tsx
```

## Documentation

For detailed documentation on specific components, see:

- [Localizedfields Implementation](../docs/LOCALIZEDFIELDS_IMPLEMENTATION.md)
- [Data Type Implementation Guide](../docs/DATA_TYPE_IMPLEMENTATION.md)
