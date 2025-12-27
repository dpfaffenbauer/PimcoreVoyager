/**
 * Base types for Data Type components
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DataTypeConfig {
  label: string;
  name: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
}

export interface DataTypeDisplayProps<T = any> {
  value: T;
  config: DataTypeConfig;
}

export interface DataTypeEditProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  config: DataTypeConfig;
  error?: string;
  readonly?: boolean;
}
