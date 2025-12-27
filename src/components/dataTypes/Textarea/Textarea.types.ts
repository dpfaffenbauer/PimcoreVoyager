/**
 * Textarea Data Type - Type Definitions
 * TypeScript types for Pimcore Textarea field
 */

export interface TextareaValue {
  value: string;
}

export interface TextareaConfig {
  label: string;
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  defaultValue?: string;
  rows?: number;
  readonly?: boolean;
  width?: number;
  height?: number;
}
