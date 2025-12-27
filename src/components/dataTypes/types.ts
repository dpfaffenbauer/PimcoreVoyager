/**
 * Common types for data type components
 */

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

export interface DataTypeConfig {
  label: string;
  name: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  [key: string]: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface DataTypeTransformer<ApiType = any, UiType = any> {
  fromAPI: (apiValue: ApiType) => UiType;
  toAPI: (uiValue: UiType) => ApiType;
}

export interface SelectOption {
  key: string;
  value: string | number;
}
