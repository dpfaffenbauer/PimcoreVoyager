/**
 * Data Type Registry
 * Central registry for all Pimcore Data Object types
 */

import { DataTypeRegistry } from '../types';
import { LinkDisplay, LinkEdit, validateLink, LinkTransformer } from '../Link';

/**
 * Registry of all data types
 * Maps Pimcore field type names to their implementations
 */
export const dataTypeRegistry: DataTypeRegistry = {
  link: {
    display: LinkDisplay,
    edit: LinkEdit,
    validator: validateLink,
    transformer: LinkTransformer,
  },
  // Additional data types can be registered here
};

/**
 * Get a data type definition by name
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
 * Get all registered data type names
 */
export function getRegisteredTypes(): string[] {
  return Object.keys(dataTypeRegistry);
}
