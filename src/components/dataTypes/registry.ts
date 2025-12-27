/**
 * Data Type Registry
 * Central registry for all Pimcore data type components
 */

import { DataTypeRegistry } from './types';
import {
  ManyToOneRelationDisplay,
  ManyToOneRelationEdit,
  validateManyToOneRelation,
  ManyToOneRelationTransformer,
} from './ManyToOneRelation';

/**
 * Registry of all available data types
 * Maps Pimcore field type names to their implementations
 */
export const dataTypeRegistry: DataTypeRegistry = {
  // Many-to-One Relation
  'manyToOneRelation': {
    display: ManyToOneRelationDisplay,
    edit: ManyToOneRelationEdit,
    validator: validateManyToOneRelation,
    transformer: ManyToOneRelationTransformer,
  },
  // Aliases for compatibility
  'many-to-one-relation': {
    display: ManyToOneRelationDisplay,
    edit: ManyToOneRelationEdit,
    validator: validateManyToOneRelation,
    transformer: ManyToOneRelationTransformer,
  },
  'manytoone': {
    display: ManyToOneRelationDisplay,
    edit: ManyToOneRelationEdit,
    validator: validateManyToOneRelation,
    transformer: ManyToOneRelationTransformer,
  },
  'relation': {
    display: ManyToOneRelationDisplay,
    edit: ManyToOneRelationEdit,
    validator: validateManyToOneRelation,
    transformer: ManyToOneRelationTransformer,
  },
};

/**
 * Get data type components by type name
 */
export function getDataType(typeName: string) {
  const normalizedType = typeName.toLowerCase().replace(/_/g, '');
  return (
    dataTypeRegistry[typeName] ||
    dataTypeRegistry[normalizedType] ||
    dataTypeRegistry['manyToOneRelation']
  );
}

/**
 * Check if a data type is registered
 */
export function hasDataType(typeName: string): boolean {
  return typeName in dataTypeRegistry;
}

/**
 * Get all registered data type names
 */
export function getRegisteredTypes(): string[] {
  return Object.keys(dataTypeRegistry);
}
