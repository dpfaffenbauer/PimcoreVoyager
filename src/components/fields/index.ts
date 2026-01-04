/**
 * Field Renderer Registry
 * Combines all field type renderers into a single lookup map
 * All field components support both view and edit modes
 */

import { FieldRendererComponent } from './types';
import { textFieldTypes } from './TextFields';
import { dateFieldTypes } from './DateFields';
import { selectFieldTypes, MultiselectField } from './SelectFields';
import { booleanFieldTypes } from './BooleanFields';
import { numericFieldTypes } from './NumericFields';
import { mediaFieldTypes } from './MediaFields';
import { linkFieldTypes } from './LinkFields';
import { geoFieldTypes } from './GeoFields';
import { tableFieldTypes } from './TableFields';
import { relationFieldTypes, ManyToManyRelationField } from './RelationFields';
import { additionalFieldTypes } from './AdditionalFields';

// Export specific types (not using export * to avoid conflicts)
export type {
  FieldDefinition,
  FieldOption,
  FieldRendererProps,
  FieldRendererComponent,
  EditableFieldProps,
  EditableFieldComponent,
} from './types';
export { FieldWrapper } from './FieldWrapper';

// Export individual field components for direct use
export { InputField, TextareaField, WysiwygField, PasswordField, CalculatedValueField } from './TextFields';
export { SelectField, MultiselectField, CountryField, LanguageField, GenderField } from './SelectFields';
export { DatetimeField, DateField, TimeField, DateRangeField } from './DateFields';
export { CheckboxField, BooleanSelectField, ConsentField } from './BooleanFields';
export { NumericField, QuantityValueField, SliderField, NumericRangeField } from './NumericFields';
export { ImageField, ImageGalleryField, VideoField } from './MediaFields';
export { LinkField } from './LinkFields';
export { GeopointField, GeoboundsField, GeopolygonField } from './GeoFields';
export { RelationField, ManyToOneRelationField, ManyToManyRelationField } from './RelationFields';

// Combined registry of all field renderers
export const fieldRenderers: Record<string, FieldRendererComponent> = {
  ...textFieldTypes,
  ...dateFieldTypes,
  ...selectFieldTypes,
  ...booleanFieldTypes,
  ...numericFieldTypes,
  ...mediaFieldTypes,
  ...linkFieldTypes,
  ...geoFieldTypes,
  ...tableFieldTypes,
  ...relationFieldTypes,
  ...additionalFieldTypes,
  // Additional aliases
  countryMultiselect: MultiselectField,
  languageMultiselect: MultiselectField,
  reverseObjectRelation: ManyToManyRelationField,
};

// Helper to get renderer for a field type
export const getFieldRenderer = (fieldtype: string): FieldRendererComponent | undefined => {
  return fieldRenderers[fieldtype];
};

// Check if a field type is supported
export const isFieldTypeSupported = (fieldtype: string): boolean => {
  return fieldtype in fieldRenderers;
};

// Get all supported field types
export const getSupportedFieldTypes = (): string[] => {
  return Object.keys(fieldRenderers);
};
