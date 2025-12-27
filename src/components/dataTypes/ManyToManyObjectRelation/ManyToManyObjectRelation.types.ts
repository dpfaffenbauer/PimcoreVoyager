/**
 * Type definitions for Many-to-Many Object Relation
 * Based on Pimcore Studio UI implementation
 */

export interface RelatedObject {
  id: number;
  key: string;
  path: string;
  fullPath: string;
  type: string;
  className?: string;
  published?: boolean;
}

export type ManyToManyObjectRelationValue = RelatedObject[];

export interface ManyToManyObjectRelationConfig {
  label: string;
  name: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  classes?: string[]; // Allowed classes for relations
  pathFormatterClass?: string;
  optimizedAdminLoading?: boolean;
  enableTextSelection?: boolean;
  visibleFields?: string[];
  allowedClassId?: string;
  visibleFieldDefinitions?: Array<{
    name: string;
    title: string;
    type: string;
  }>;
}
