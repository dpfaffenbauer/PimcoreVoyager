/**
 * Shared types for field renderers
 */

import type { FC } from 'react';

export interface FieldDefinition {
  name: string;
  title: string;
  fieldtype: string;
  tooltip?: string;
  mandatory?: boolean;
  noteditable?: boolean;
  children?: FieldDefinition[];
  permissionView?: string[];
  permissionEdit?: string[];
  datatype?: string;
  [key: string]: any;
}

// Option type for select fields
export interface FieldOption {
  key: string;
  value: string;
}

// Props for field renderers (supports both view and edit modes)
export interface FieldRendererProps {
  value: any;
  title: string;
  mandatory?: boolean;
  field?: FieldDefinition;
  // Edit mode props
  isEditing?: boolean;
  onFieldChange?: (value: any) => void;
  error?: string;
}

export type FieldRendererComponent = FC<FieldRendererProps>;

// Props for editable field components (supports both view and edit modes)
export interface EditableFieldProps extends FieldRendererProps {
  isEditing?: boolean;
  onChange?: (value: any) => void;
  error?: string;
  disabled?: boolean;
}

export type EditableFieldComponent = FC<EditableFieldProps>;
