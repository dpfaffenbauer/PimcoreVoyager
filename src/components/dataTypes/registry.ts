/**
 * Data Type Registry
 * Central registry for all Pimcore data object types
 */

import { DataTypeRegistry } from './common/types';
import {
  LocalizedfieldsDisplay,
  LocalizedfieldsEdit,
  validateLocalizedfields,
  LocalizedfieldsTransformer,
} from './Localizedfields';

export const dataTypeRegistry: DataTypeRegistry = {
  localizedfields: {
    display: LocalizedfieldsDisplay,
    edit: LocalizedfieldsEdit,
    validator: (value: any, config: any) => validateLocalizedfields(value, config),
    transformer: LocalizedfieldsTransformer,
  },
  // Future data types will be registered here
  // Example:
  // 'input': {
  //   display: InputDisplay,
  //   edit: InputEdit,
  //   validator: validateInput,
  //   transformer: InputTransformer,
  // },
};

/**
 * Get a data type definition from the registry
 */
export function getDataType(typeName: string) {
  return dataTypeRegistry[typeName.toLowerCase()];
}

/**
 * Check if a data type is registered
 */
export function hasDataType(typeName: string): boolean {
  return typeName.toLowerCase() in dataTypeRegistry;
}

/**
 * Register a new data type
 */
export function registerDataType(typeName: string, definition: DataTypeRegistry[string]) {
  dataTypeRegistry[typeName.toLowerCase()] = definition;
}
