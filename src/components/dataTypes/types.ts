/**
 * Common types for Pimcore Data Type Components
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
  [key: string]: any;
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

export interface DataTypeTransformer<TApi = any, TUi = any> {
  fromAPI: (apiValue: TApi) => TUi;
  toAPI: (uiValue: TUi) => TApi;
}

export interface DataTypeValidator<T = any> {
  (value: T, config: DataTypeConfig): ValidationResult;
}

export interface DataTypeRegistryEntry {
  display: React.ComponentType<DataTypeDisplayProps<any>>;
  edit: React.ComponentType<DataTypeEditProps<any>>;
  validator: DataTypeValidator<any>;
  transformer: DataTypeTransformer<any, any>;
}
