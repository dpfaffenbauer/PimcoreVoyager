/**
 * Pimcore API Types
 */

export interface PimcoreClassDefinition {
  id: string;
  name: string;
  description?: string;
  fields?: PimcoreField[];
}

export interface PimcoreField {
  name: string;
  title: string;
  type: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
}

export interface PimcoreDataObject {
  id: number;
  key: string;
  path: string;
  type: string;
  className?: string;
  published?: boolean;
  modificationDate?: number;
  creationDate?: number;
  elements?: Record<string, any>;
  parentId?: number;
  hasChildren?: boolean;
  filename?: string;
}

export interface PimcoreListResponse<T> {
  data: T[];
  total: number;
}

export interface PimcoreApiError {
  message: string;
  code?: number;
}
