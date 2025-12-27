/**
 * Data Type Registry
 * Central registry for all Pimcore data type components
 */

import React from 'react';
import {
  ManyToManyRelationDisplay,
  ManyToManyRelationEdit,
  validateManyToManyRelation,
  ManyToManyRelationTransformer,
} from './ManyToManyRelation';
import type { ValidationResult } from './ManyToManyRelation';

export interface DataTypeDisplayProps<T = any, C = any> {
  value: T;
  config: C;
}

export interface DataTypeEditProps<T = any, C = any> {
  value: T;
  onChange: (value: T) => void;
  config: C;
  error?: string;
  readonly?: boolean;
}

export interface DataTypeDefinition<T = any, C = any> {
  display: React.ComponentType<DataTypeDisplayProps<T, C>>;
  edit: React.ComponentType<DataTypeEditProps<T, C>>;
  validator: (value: T, config: C) => ValidationResult;
  transformer: {
    fromAPI: (apiValue: any) => T;
    toAPI: (uiValue: T) => any;
    isEmpty?: (value: T) => boolean;
  };
}

/**
 * Registry of all supported data types
 */
export const dataTypeRegistry: Record<string, DataTypeDefinition> = {
  manyToManyRelation: {
    display: ManyToManyRelationDisplay,
    edit: ManyToManyRelationEdit,
    validator: validateManyToManyRelation,
    transformer: ManyToManyRelationTransformer,
  },
  // Additional data types can be registered here as they are implemented
  // Example:
  // input: {
  //   display: InputDisplay,
  //   edit: InputEdit,
  //   validator: validateInput,
  //   transformer: InputTransformer,
  // },
};

/**
 * Get data type definition by type name
 */
export function getDataTypeDefinition(typeName: string): DataTypeDefinition | undefined {
  return dataTypeRegistry[typeName];
}

/**
 * Check if a data type is supported
 */
export function isDataTypeSupported(typeName: string): boolean {
  return typeName in dataTypeRegistry;
}

/**
 * Get list of all supported data type names
 */
export function getSupportedDataTypes(): string[] {
  return Object.keys(dataTypeRegistry);
}
