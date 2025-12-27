/**
 * Type definitions for Many-to-Many Relation data type
 * Based on Pimcore Studio UI Bundle implementation
 */

/**
 * Represents a single related object in the relation
 */
export interface ManyToManyRelationItem {
  id: number;
  type: 'object' | 'asset' | 'document';
  subtype?: string;
  path: string;
  key?: string;
  className?: string;
  published?: boolean;
}

/**
 * The value type for Many-to-Many Relation field
 */
export type ManyToManyRelationValue = ManyToManyRelationItem[] | null;

/**
 * Configuration for Many-to-Many Relation field from class definition
 */
export interface ManyToManyRelationConfig {
  name: string;
  title: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  
  // Relation-specific config
  classes?: string[]; // Allowed object classes
  types?: Array<'object' | 'asset' | 'document'>; // Allowed element types
  maxItems?: number | null; // Maximum number of relations
  allowToClearRelation?: boolean;
  assetUploadPath?: string | null;
  pathFormatterClass?: string | null;
  width?: number | string | null;
  height?: number | string | null;
  assetInlineDownloadAllowed?: boolean;
}

/**
 * Search result item for adding new relations
 */
export interface RelationSearchResult {
  id: number;
  type: 'object' | 'asset' | 'document';
  subtype?: string;
  path: string;
  key?: string;
  className?: string;
  published?: boolean;
}

/**
 * Validation result for relation field
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
