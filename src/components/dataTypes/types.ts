/**
 * Common Data Type Definitions
 * Base types and interfaces for all data type components
 */

export interface BaseFieldConfig {
  label: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
}

export interface DataTypeDisplayProps<T = any, C = BaseFieldConfig> {
  value: T;
  config: C;
}

export interface DataTypeEditProps<T = any, C = BaseFieldConfig> {
  value: T;
  onChange: (value: T) => void;
  config: C;
  error?: string;
  readonly?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DataTypeTransformer<ApiType = any, UiType = any> {
  fromAPI: (apiValue: ApiType) => UiType;
  toAPI: (uiValue: UiType) => ApiType;
}

export interface DataTypeDefinition<T = any, C = BaseFieldConfig> {
  display: React.ComponentType<DataTypeDisplayProps<T, C>>;
  edit: React.ComponentType<DataTypeEditProps<T, C>>;
  validator: (value: T, config: C) => ValidationResult;
  transformer: DataTypeTransformer<any, T>;
}
