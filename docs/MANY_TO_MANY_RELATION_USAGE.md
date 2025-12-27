# Many-to-Many Object Relation - Usage Guide

## Overview

The Many-to-Many Object Relation component allows users to display and edit relationships between Pimcore data objects. It supports:

- ✅ Display of related objects with key information
- ✅ Search and filter functionality
- ✅ Add/remove relations
- ✅ Class filtering
- ✅ Validation based on configuration
- ✅ Touch-optimized mobile interface

## Components

### ManyToManyObjectRelationDisplay

**Purpose**: Read-only display of related objects

**Features**:
- Horizontal scrollable list of related objects
- Shows object key, class name, ID, and path
- Publication status indicator
- Touch support to navigate to related objects
- Empty state when no relations exist

**Usage**:
```typescript
import { ManyToManyObjectRelationDisplay } from './components/dataTypes';

const config = {
  label: 'Related Products',
  name: 'relatedProducts',
  classes: ['Product', 'Category'],
};

const value = [
  {
    id: 123,
    key: 'product-1',
    path: '/products/product-1',
    fullPath: '/products/product-1',
    type: 'object',
    className: 'Product',
    published: true,
  },
  // ... more objects
];

<ManyToManyObjectRelationDisplay
  value={value}
  config={config}
  onObjectPress={(object) => {
    // Navigate to object detail
    navigation.navigate('ObjectDetail', { objectId: object.id });
  }}
/>
```

### ManyToManyObjectRelationEdit

**Purpose**: Edit relations with search and selection

**Features**:
- Add new relations via search modal
- Remove existing relations
- Filter by class
- Real-time search
- Validation feedback
- Readonly mode support

**Usage**:
```typescript
import { ManyToManyObjectRelationEdit } from './components/dataTypes';

const [relations, setRelations] = useState([]);
const [error, setError] = useState('');

const config = {
  label: 'Related Products',
  name: 'relatedProducts',
  mandatory: true,
  classes: ['Product', 'Category'],
  allowedClassId: 'Product', // Optional: restrict to single class
};

<ManyToManyObjectRelationEdit
  value={relations}
  onChange={(newValue) => {
    setRelations(newValue);
    // Validate
    const result = validateManyToManyObjectRelation(newValue, config);
    setError(result.valid ? '' : result.errors[0]);
  }}
  config={config}
  error={error}
  readonly={false}
/>
```

## Configuration Options

### Basic Configuration

```typescript
interface ManyToManyObjectRelationConfig {
  label: string;              // Field label
  name: string;               // Field name
  mandatory?: boolean;        // Required field validation
  noteditable?: boolean;      // Display as readonly
  invisible?: boolean;        // Hide field
}
```

### Advanced Configuration

```typescript
interface ManyToManyObjectRelationConfig {
  // ... basic config
  classes?: string[];               // Allowed object classes
  allowedClassId?: string;          // Single allowed class
  pathFormatterClass?: string;      // Custom path formatter
  optimizedAdminLoading?: boolean;  // Performance optimization
  enableTextSelection?: boolean;    // Allow text selection
  visibleFields?: string[];         // Fields to display in search
  visibleFieldDefinitions?: Array<{
    name: string;
    title: string;
    type: string;
  }>;
}
```

## Validation

The validator checks:
- Required fields (at least one relation if mandatory)
- Valid object IDs
- Allowed classes
- Class restrictions

```typescript
import { validateManyToManyObjectRelation } from './components/dataTypes';

const result = validateManyToManyObjectRelation(value, config);

if (!result.valid) {
  console.error('Validation errors:', result.errors);
}
```

## Data Transformation

### From API to UI

```typescript
import { ManyToManyObjectRelationTransformer } from './components/dataTypes';

// API response
const apiData = [
  { id: 123, key: 'product-1', className: 'Product', ... },
  { id: 456, key: 'product-2', className: 'Product', ... },
];

// Transform for UI
const uiData = ManyToManyObjectRelationTransformer.fromAPI(apiData);
```

### From UI to API

```typescript
// UI data
const uiData = [
  { id: 123, key: 'product-1', path: '/products/product-1', ... },
];

// Transform for API
const apiData = ManyToManyObjectRelationTransformer.toAPI(uiData);
// Returns: [{ id: 123, type: 'object', className: 'Product' }]
```

## Integration with Data Type Registry

```typescript
import { dataTypeRegistry, getDataType } from './components/dataTypes';

// Get registered data type
const dataType = getDataType('manyToManyObjectRelation');

// Use components
const DisplayComponent = dataType.display;
const EditComponent = dataType.edit;
const validator = dataType.validator;
const transformer = dataType.transformer;
```

## Complete Example

```typescript
import React, { useState } from 'react';
import { View } from 'react-native';
import {
  ManyToManyObjectRelationEdit,
  validateManyToManyObjectRelation,
  ManyToManyObjectRelationTransformer,
} from './components/dataTypes';

function ProductEditScreen({ product, onSave }) {
  const [relatedProducts, setRelatedProducts] = useState(
    ManyToManyObjectRelationTransformer.fromAPI(product.relatedProducts)
  );
  const [error, setError] = useState('');

  const config = {
    label: 'Verwandte Produkte',
    name: 'relatedProducts',
    mandatory: false,
    classes: ['Product'],
  };

  const handleSave = () => {
    // Validate
    const result = validateManyToManyObjectRelation(relatedProducts, config);
    
    if (!result.valid) {
      setError(result.errors[0]);
      return;
    }

    // Transform for API
    const apiData = ManyToManyObjectRelationTransformer.toAPI(relatedProducts);
    
    // Save
    onSave({
      ...product,
      relatedProducts: apiData,
    });
  };

  return (
    <View>
      <ManyToManyObjectRelationEdit
        value={relatedProducts}
        onChange={(newValue) => {
          setRelatedProducts(newValue);
          // Clear error on change
          setError('');
        }}
        config={config}
        error={error}
      />
      
      <Button title="Speichern" onPress={handleSave} />
    </View>
  );
}
```

## Search Integration

The edit component uses `PimcoreService.getDataObjects()` for searching. Ensure your Pimcore instance supports these endpoints:

- `GET /pimcore-studio/api/data-objects/tree?classIds=["Product"]&page=1&pageSize=50`

The search filters results by:
- Object key (case-insensitive)
- Object path (case-insensitive)
- Selected class

## Styling

All components use React Native Paper for Material Design styling. You can customize by:

1. **Override styles**: Pass custom styles through props (when available)
2. **Theme**: Configure React Native Paper theme globally
3. **Fork components**: Copy and modify for custom requirements

## Performance Tips

1. **Lazy Loading**: Use pagination in search results
2. **Virtualization**: For large relation lists, consider FlatList optimization
3. **Debounce**: Add search debouncing for better UX
4. **Caching**: Cache search results to avoid duplicate API calls

## Accessibility

Components support:
- Screen reader labels
- Touch target sizes (min 44x44 points)
- Contrast ratios for text
- Keyboard navigation (where applicable)

## Known Limitations

1. **Search**: Currently loads all objects and filters locally. For large datasets, implement server-side filtering.
2. **Offline**: Requires network connection for search. Consider caching frequently used objects.
3. **Sorting**: Relations are displayed in the order they were added. Sorting is not yet implemented.
4. **Bulk Operations**: No bulk add/remove. Each relation is managed individually.

## Future Enhancements

- [ ] Server-side search with pagination
- [ ] Drag-and-drop reordering
- [ ] Bulk selection
- [ ] Relation metadata (e.g., relationship type, weight)
- [ ] Advanced filters (date, status, custom fields)
- [ ] Export/Import relations
- [ ] Offline support with local caching

## Troubleshooting

### Search not working
- Check network connection
- Verify Pimcore API endpoint is accessible
- Check console for API errors

### Validation errors
- Ensure `mandatory` field has at least one relation
- Check `classes` configuration matches object classes
- Verify object IDs are valid

### UI not updating
- Ensure `onChange` is called with new value
- Check React state updates are immutable
- Verify component re-renders on value change

## Support

For issues or questions:
1. Check existing GitHub issues
2. Review Pimcore Studio API documentation
3. Contact repository maintainers
