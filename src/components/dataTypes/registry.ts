/**
 * Data Type Registry
 * Central registry for all Pimcore data types
 */

import { MultiselectDisplay, MultiselectEdit, validateMultiselect, MultiselectTransformer } from './Multiselect';
import type { DataTypeDisplayProps, DataTypeEditProps, ValidationResult, DataTypeTransformer } from './types';

export interface DataTypeRegistryEntry {
  display: React.ComponentType<DataTypeDisplayProps<any>>;
  edit: React.ComponentType<DataTypeEditProps<any>>;
  validator: (value: any, config: any) => ValidationResult;
  transformer: DataTypeTransformer<any, any>;
}

export interface DataTypeRegistry {
  [key: string]: DataTypeRegistryEntry;
}

/**
 * Registry of all available data types
 */
export const dataTypeRegistry: DataTypeRegistry = {
  multiselect: {
    display: MultiselectDisplay,
    edit: MultiselectEdit,
    validator: validateMultiselect,
    transformer: MultiselectTransformer,
  },
  // Add more data types here as they are implemented
};

/**
 * Get a data type component by type name
 */
export function getDataType(typeName: string): DataTypeRegistryEntry | undefined {
  return dataTypeRegistry[typeName.toLowerCase()];
}

/**
 * Check if a data type is registered
 */
export function hasDataType(typeName: string): boolean {
  return typeName.toLowerCase() in dataTypeRegistry;
}
