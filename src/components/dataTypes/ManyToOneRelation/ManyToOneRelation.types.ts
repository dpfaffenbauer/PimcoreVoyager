/**
 * Types for Many-to-One Relation Field
 */

import { BaseFieldConfig } from '../types';

/**
 * Value structure for Many-to-One Relation
 */
export interface ManyToOneRelationValue {
  id: number;
  type: string;
  className?: string;
  key?: string;
  path?: string;
  published?: boolean;
}

/**
 * Configuration for Many-to-One Relation Field
 */
export interface ManyToOneRelationConfig extends BaseFieldConfig {
  /**
   * Allowed classes for the relation
   */
  classes?: string[];
  
  /**
   * Display fields to show in relation preview
   */
  displayFields?: string[];
  
  /**
   * Whether to allow creating new objects
   */
  allowCreate?: boolean;
  
  /**
   * Maximum number of results for search
   */
  maxItems?: number;
  
  /**
   * Path restrictions for object selection
   */
  pathFormatterClass?: string;
  
  /**
   * Asset types if relation can include assets
   */
  assetTypes?: string[];
  
  /**
   * Document types if relation can include documents
   */
  documentTypes?: string[];
}

/**
 * Search result for relation objects
 */
export interface RelationSearchResult {
  id: number;
  type: string;
  className?: string;
  key: string;
  path: string;
  fullPath: string;
  published?: boolean;
  modificationDate?: number;
}
