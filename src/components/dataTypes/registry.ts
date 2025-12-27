/**
 * Data Type Registry
 * Central registry for all Pimcore data type components
 */

import { DataTypeRegistryEntry } from './types';
import {
  ManyToManyObjectRelationDisplay,
  ManyToManyObjectRelationEdit,
  validateManyToManyObjectRelation,
  ManyToManyObjectRelationTransformer,
} from './ManyToManyObjectRelation';

export const dataTypeRegistry: Record<string, DataTypeRegistryEntry> = {
  'manyToManyObjectRelation': {
    display: ManyToManyObjectRelationDisplay,
    edit: ManyToManyObjectRelationEdit,
    validator: validateManyToManyObjectRelation,
    transformer: ManyToManyObjectRelationTransformer,
  },
  // Aliases for different naming conventions
  'many-to-many-object-relation': {
    display: ManyToManyObjectRelationDisplay,
    edit: ManyToManyObjectRelationEdit,
    validator: validateManyToManyObjectRelation,
    transformer: ManyToManyObjectRelationTransformer,
  },
  'advancedManyToManyObjectRelation': {
    display: ManyToManyObjectRelationDisplay,
    edit: ManyToManyObjectRelationEdit,
    validator: validateManyToManyObjectRelation,
    transformer: ManyToManyObjectRelationTransformer,
  },
  // Future data types can be added here
};

/**
 * Get a registered data type by type name
 */
export function getDataType(typeName: string): DataTypeRegistryEntry | undefined {
  return dataTypeRegistry[typeName] || dataTypeRegistry[typeName.toLowerCase()];
}

/**
 * Check if a data type is registered
 */
export function hasDataType(typeName: string): boolean {
  return typeName in dataTypeRegistry || typeName.toLowerCase() in dataTypeRegistry;
}

/**
 * Get all registered data type names
 */
export function getRegisteredDataTypes(): string[] {
  return Object.keys(dataTypeRegistry);
}
