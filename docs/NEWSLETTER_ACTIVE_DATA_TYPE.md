# Newsletter Active Data Type

## Overview

The Newsletter Active data type is a boolean field component for Pimcore Data Objects that indicates whether a newsletter subscription is active or inactive. It provides a mobile-optimized interface for displaying and editing newsletter subscription status.

## Features

- ✅ **Simple Boolean Toggle**: Easy on/off switch control
- ✅ **Mobile Optimized**: Touch-friendly switch component with clear visual feedback
- ✅ **Validation Support**: Built-in validation for mandatory fields
- ✅ **Read-only Mode**: Supports locked/read-only state with visual indicator
- ✅ **Error Display**: Clear error messages with icon indicators
- ✅ **Accessibility**: Properly labeled controls for screen readers
- ✅ **Platform Adaptive**: Native switch appearance on iOS and Android

## Components

### NewsletterActiveDisplay

**Purpose**: Read-only display of newsletter subscription status.

**Props**:
- `value` (boolean): The current newsletter active state
- `config` (NewsletterActiveConfig): Field configuration including label

**Features**:
- Color-coded status indicator (green for active, gray for inactive)
- Icon representation (check-circle for active, close-circle for inactive)
- Clear text label showing "Active" or "Inactive"

**Example Usage**:
```tsx
import { NewsletterActiveDisplay } from '@/components/dataTypes/NewsletterActive';

<NewsletterActiveDisplay
  value={true}
  config={{ label: 'Newsletter Subscription' }}
/>
```

### NewsletterActiveEdit

**Purpose**: Interactive editing component with switch control.

**Props**:
- `value` (boolean): The current newsletter active state
- `onChange` (function): Callback when value changes
- `config` (NewsletterActiveConfig): Field configuration
- `error` (string, optional): Validation error message
- `readonly` (boolean, optional): Whether the field is read-only

**Features**:
- Native iOS/Android switch control
- Status display with email icon (active/inactive)
- Help text guiding user action
- Error display with alert icon
- Mandatory field indicator (asterisk)
- Read-only badge when disabled
- Touch-optimized container for easy interaction

**Example Usage**:
```tsx
import { NewsletterActiveEdit } from '@/components/dataTypes/NewsletterActive';

<NewsletterActiveEdit
  value={isActive}
  onChange={setIsActive}
  config={{ 
    label: 'Newsletter Subscription',
    mandatory: true 
  }}
  error={validationError}
  readonly={!hasEditPermission}
/>
```

## Configuration

### NewsletterActiveConfig

```typescript
interface NewsletterActiveConfig {
  label: string;           // Field label displayed to user
  mandatory?: boolean;     // Whether field is required (shows asterisk)
  noteditable?: boolean;   // Whether field is read-only
  invisible?: boolean;     // Whether field should be hidden
  defaultValue?: boolean;  // Default value when creating new object
}
```

## Validation

The `validateNewsletterActive` function ensures data integrity:

**Validation Rules**:
1. **Mandatory Check**: If field is mandatory, value cannot be null or undefined
2. **Boolean Values**: Accepts `true` or `false` as valid values

**Example**:
```typescript
import { validateNewsletterActive } from '@/components/dataTypes/NewsletterActive';

const result = validateNewsletterActive(value, {
  label: 'Newsletter Active',
  mandatory: true
});

if (!result.valid) {
  console.error(result.errors);
}
```

## Data Transformation

The `NewsletterActiveTransformer` handles conversion between Pimcore API and UI formats:

### fromAPI (API → UI)

Converts various API formats to boolean:
- `true` / `false` → `true` / `false`
- `1` / `0` → `true` / `false`
- `"true"` / `"false"` → `true` / `false`
- `"yes"` / `"no"` → `true` / `false`
- `"active"` / `"inactive"` → `true` / `false`
- `null` / `undefined` → `false`

**Example**:
```typescript
import { NewsletterActiveTransformer } from '@/components/dataTypes/NewsletterActive';

const uiValue = NewsletterActiveTransformer.fromAPI(apiResponse.newsletterActive);
// Input: 1 → Output: true
// Input: "yes" → Output: true
// Input: null → Output: false
```

### toAPI (UI → API)

Converts boolean to API format:
- Ensures value is strictly boolean (`true` or `false`)

**Example**:
```typescript
const apiValue = NewsletterActiveTransformer.toAPI(true);
// Output: true (boolean)
```

## Mobile Optimization

The Newsletter Active component is specifically designed for mobile use:

### Touch Targets
- Minimum touch target size of 44x44 points (iOS HIG)
- Entire card is tappable, not just the switch
- Visual feedback on touch with activeOpacity

### Visual Hierarchy
- Clear status indication with icons and colors
- Large, readable text (16sp for status)
- Proper contrast ratios for accessibility

### Platform Differences
- **iOS**: Native UISwitch appearance with green track when active
- **Android**: Material Design switch with ripple effect

### Performance
- Optimized re-renders with proper prop handling
- Minimal component tree depth
- No expensive computations in render

## Testing

Comprehensive test coverage includes:

1. **Display Component Tests**
   - Active status rendering
   - Inactive status rendering
   - Undefined/null value handling

2. **Edit Component Tests**
   - Initial value rendering
   - Toggle functionality
   - Error display
   - Mandatory indicator
   - Read-only mode
   - Help text visibility

3. **Validator Tests**
   - Non-mandatory field validation
   - Mandatory field with true/false values
   - Mandatory field with null/undefined values

4. **Transformer Tests**
   - Boolean conversion (true/false)
   - Number conversion (1/0)
   - String conversion (various formats)
   - Null/undefined handling
   - Unknown type handling

**Run Tests**:
```bash
npm test -- NewsletterActive.test.tsx
```

## Integration Example

Complete example showing Newsletter Active in a data object form:

```tsx
import React, { useState } from 'react';
import { View } from 'react-native';
import { 
  NewsletterActiveEdit,
  validateNewsletterActive,
  NewsletterActiveTransformer 
} from '@/components/dataTypes/NewsletterActive';

function CustomerForm({ customer, onSave }) {
  const [newsletterActive, setNewsletterActive] = useState(
    NewsletterActiveTransformer.fromAPI(customer.newsletterActive)
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = () => {
    // Validate
    const validation = validateNewsletterActive(newsletterActive, {
      label: 'Newsletter Subscription',
      mandatory: true
    });

    if (!validation.valid) {
      setErrors({ newsletterActive: validation.errors[0] });
      return;
    }

    // Transform and save
    const apiValue = NewsletterActiveTransformer.toAPI(newsletterActive);
    onSave({ ...customer, newsletterActive: apiValue });
  };

  return (
    <View>
      <NewsletterActiveEdit
        value={newsletterActive}
        onChange={setNewsletterActive}
        config={{
          label: 'Newsletter Subscription',
          mandatory: true
        }}
        error={errors.newsletterActive}
      />
      {/* Other form fields... */}
    </View>
  );
}
```

## Registry Integration

The Newsletter Active type is automatically registered in the data type registry:

```typescript
import { getDataType } from '@/components/dataTypes';

const newsletterActiveType = getDataType('newsletterActive');
// Returns: { display, edit, validator, transformer }
```

## Best Practices

1. **Always Use Transformer**: Convert API values through transformer to ensure consistent boolean format
2. **Validate Before Save**: Run validation before submitting to API
3. **Handle Errors Gracefully**: Display validation errors clearly to user
4. **Respect Read-only**: Check permissions and set readonly prop appropriately
5. **Default to False**: When in doubt, treat null/undefined as false for safety
6. **Test on Both Platforms**: Verify behavior on iOS and Android devices

## Accessibility

- Switch has proper `accessibilityRole="switch"`
- Labels are associated with controls
- Error messages announced by screen readers
- Sufficient color contrast for visually impaired users
- Touch targets meet minimum size requirements

## Browser/Platform Support

- ✅ iOS 12+
- ✅ Android 5.0+ (API 21+)
- ✅ React Native 0.70+
- ✅ Expo SDK 48+

## Related Data Types

Similar boolean/checkbox types that could be implemented:
- `checkbox` - Generic boolean checkbox
- `newsletterConfirmed` - Newsletter confirmation status
- `consent` - Generic consent field
- `switch` - Generic switch/toggle field

## Future Enhancements

Potential improvements for future versions:
- Animation on state change
- Haptic feedback on toggle
- Batch toggle for multiple objects
- History tracking of state changes
- Custom color themes

## Support

For issues or questions:
1. Check the [Data Type Implementation Guide](./DATA_TYPE_IMPLEMENTATION.md)
2. Review test cases for usage examples
3. Open an issue on GitHub
