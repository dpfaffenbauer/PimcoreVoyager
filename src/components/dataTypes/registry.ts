/**
 * Data Type Registry
 * Central registry for all Pimcore data type implementations
 */

import type { DataTypeDefinition } from './types';
import {
  NewsletterActiveDisplay,
  NewsletterActiveEdit,
  validateNewsletterActive,
  NewsletterActiveTransformer,
} from './NewsletterActive';

/**
 * Registry of all available data types
 * Maps Pimcore data type names to their component implementations
 */
export const dataTypeRegistry: Record<string, DataTypeDefinition<any, any>> = {
  newsletterActive: {
    display: NewsletterActiveDisplay,
    edit: NewsletterActiveEdit,
    validator: validateNewsletterActive,
    transformer: NewsletterActiveTransformer,
  },
  // Add more data types here as they are implemented
};

/**
 * Get a data type definition by name
 * @param typeName - The name of the data type
 * @returns The data type definition or undefined if not found
 */
export function getDataType(typeName: string): DataTypeDefinition<any, any> | undefined {
  return dataTypeRegistry[typeName];
}

/**
 * Check if a data type is registered
 * @param typeName - The name of the data type
 * @returns True if the data type is registered
 */
export function hasDataType(typeName: string): boolean {
  return typeName in dataTypeRegistry;
}

/**
 * Get all registered data type names
 * @returns Array of registered data type names
 */
export function getRegisteredDataTypes(): string[] {
  return Object.keys(dataTypeRegistry);
}
