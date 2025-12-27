/**
 * Common types for data type components
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DataTypeDisplayProps {
  value: any;
  config: FieldConfig;
}

export interface DataTypeEditProps {
  value: any;
  onChange: (value: any) => void;
  config: FieldConfig;
  error?: string;
  readonly?: boolean;
}

export interface FieldConfig {
  name: string;
  title: string;
  label?: string;
  type: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  [key: string]: any;
}

export interface DataTypeDefinition {
  display: React.ComponentType<DataTypeDisplayProps>;
  edit: React.ComponentType<DataTypeEditProps>;
  validator?: (value: any, config: FieldConfig) => ValidationResult;
  transformer?: {
    toAPI: (value: any) => any;
    fromAPI: (value: any) => any;
  };
}

export type DataTypeRegistry = Record<string, DataTypeDefinition>;
