/**
 * Base types for Data Type Registry
 */

import React from 'react';

/**
 * Base props for all Display components
 */
export interface DataTypeDisplayProps<T = any, C = any> {
  value: T;
  config: C;
  inherited?: boolean;
  textPrefix?: string;
  textSuffix?: string;
}

/**
 * Base props for all Edit components
 */
export interface DataTypeEditProps<T = any, C = any> {
  value: T;
  onChange: (value: T) => void;
  config: C;
  error?: string;
  readonly?: boolean;
}

/**
 * Validation result structure
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Data transformer interface
 */
export interface DataTransformer<T = any> {
  fromAPI: (apiValue: any) => T;
  toAPI: (uiValue: T) => any;
}

/**
 * Validator function type
 */
export type ValidatorFunction<T = any, C = any> = (
  value: T,
  config: C
) => ValidationResult;

/**
 * Complete data type definition
 */
export interface DataTypeDefinition<T = any, C = any> {
  display: React.ComponentType<DataTypeDisplayProps<T, C>>;
  edit: React.ComponentType<DataTypeEditProps<T, C>>;
  validator?: ValidatorFunction<T, C>;
  transformer?: DataTransformer<T>;
}

/**
 * Data Type Registry interface
 */
export interface DataTypeRegistry {
  [typeName: string]: DataTypeDefinition;
}
