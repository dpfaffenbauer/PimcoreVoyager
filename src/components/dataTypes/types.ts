/**
 * Base types and interfaces for Pimcore Data Type Components
 */

import { ViewStyle } from 'react-native';

/**
 * Base configuration for all data type fields
 */
export interface BaseFieldConfig {
  name: string;
  title: string;
  type: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  tooltip?: string;
  index?: number;
}

/**
 * Props for Display Components (Read-Only)
 */
export interface DataTypeDisplayProps<TValue = any, TConfig = BaseFieldConfig> {
  value: TValue;
  config: TConfig;
  style?: ViewStyle;
}

/**
 * Props for Edit Components
 */
export interface DataTypeEditProps<TValue = any, TConfig = BaseFieldConfig> {
  value: TValue;
  onChange: (value: TValue) => void;
  config: TConfig;
  error?: string;
  readonly?: boolean;
  style?: ViewStyle;
}

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Data type validator function
 */
export type ValidatorFunction<TValue = any, TConfig = BaseFieldConfig> = (
  value: TValue,
  config: TConfig
) => ValidationResult;

/**
 * Data type transformer
 */
export interface DataTypeTransformer<TAPIValue = any, TUIValue = any> {
  fromAPI: (apiValue: TAPIValue) => TUIValue;
  toAPI: (uiValue: TUIValue) => TAPIValue;
}

/**
 * Data type component registration
 */
export interface DataTypeRegistration<TValue = any, TConfig = BaseFieldConfig> {
  display: React.ComponentType<DataTypeDisplayProps<TValue, TConfig>>;
  edit: React.ComponentType<DataTypeEditProps<TValue, TConfig>>;
  validator: ValidatorFunction<TValue, TConfig>;
  transformer: DataTypeTransformer<any, TValue>;
}

/**
 * Registry for all data types
 */
export type DataTypeRegistry = Record<string, DataTypeRegistration<any, any>>;
