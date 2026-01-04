/**
 * Pimcore API Types
 *
 * Re-exports types from @pimcore/studio-ui-bundle for consistency
 * with the official Pimcore Studio API
 */

// Re-export Data Object types from the official package
export type {
  // Core Data Object types
  DataObject,
  DataObjectFolder,
  DataObjectWithDetailData,
  DataObjectDraftData,
  DataObjectPermissions,
  DataObjectAdd,
  DataObjectCloneParameters,

  // API Request/Response types
  DataObjectGetByIdApiResponse,
  DataObjectGetByIdApiArg,
  DataObjectUpdateByIdApiResponse,
  DataObjectUpdateByIdApiArg,
  DataObjectAddApiResponse,
  DataObjectAddApiArg,
  DataObjectGetTreeApiResponse,
  DataObjectGetTreeApiArg,
  DataObjectGetLayoutByIdApiResponse,
  DataObjectGetLayoutByIdApiArg,
  DataObjectGetGridApiResponse,
  DataObjectGetGridApiArg,
  DataObjectPatchByIdApiResponse,
  DataObjectPatchByIdApiArg,
  DataObjectBatchDeleteApiResponse,
  DataObjectBatchDeleteApiArg,
  DataObjectGetSelectOptionsApiResponse,
  DataObjectGetSelectOptionsApiArg,

  // Grid types
  GridColumnConfiguration,
  GridColumnData,
  GridColumnRequest,
  GridFilter,
  GridConfiguration,
  GridDetailedConfiguration,

  // Base Element types
  Element,
  ElementIcon,
  CustomAttributes,
  Permissions,

  // Layout types
  Layout,

  // Error types
  Error as PimcoreError,
  DevError,

  // Property types
  UpdateDataProperty,
} from '@pimcore/studio-ui-bundle/api/data-object';

// Re-export Asset types
export type {
  Asset,
  AssetFolder,
  AssetGetByIdApiResponse,
  AssetGetByIdApiArg,
  AssetGetTreeApiResponse,
  AssetGetTreeApiArg,
  AssetGetGridApiResponse,
  AssetGetGridApiArg,
  Image as AssetImage,
  Video as AssetVideo,
  Audio as AssetAudio,
  AssetDocument,
  Archive as AssetArchive,
  Text as AssetText,
  Unknown as AssetUnknown,
} from '@pimcore/studio-ui-bundle/api/asset';

// Re-export Class Definition types
export type {
  ClassDefinitionGetApiResponse,
  ClassDefinition,
} from '@pimcore/studio-ui-bundle/api/class-definition';

// Re-export Workflow types
export type {
  WorkflowDetails,
} from '@pimcore/studio-ui-bundle/api/workflow';

/**
 * Legacy type aliases for backwards compatibility
 * These map our old custom types to the official Pimcore types
 */

// Import the actual types for use in aliases and type guards
import type {
  DataObject as DataObjectType,
  DataObjectFolder as DataObjectFolderType,
  DataObjectWithDetailData as DataObjectWithDetailDataType
} from '@pimcore/studio-ui-bundle/api/data-object';

// Legacy PimcoreDataObject - now use DataObject or DataObjectWithDetailData
export type PimcoreDataObject = DataObjectType | DataObjectFolderType;

// Legacy list response wrapper - still useful for our services
export interface PimcoreListResponse<T> {
  data: T[];
  total: number;
}

// Legacy error type
export interface PimcoreApiError {
  message: string;
  code?: number;
}

// Legacy class definition - keeping for backwards compatibility
// The new ClassDefinition type from the package is more complete
export interface PimcoreClassDefinition {
  id: string;
  name: string;
  description?: string;
  fields?: PimcoreField[];
}

// Legacy field definition - keeping for simple use cases
export interface PimcoreField {
  name: string;
  title: string;
  type: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
}

/**
 * Type guards for Pimcore types
 */
export function isDataObjectFolder(obj: DataObjectType | DataObjectFolderType): obj is DataObjectFolderType {
  return obj.type === 'folder';
}

export function isDataObjectWithDetailData(obj: any): obj is DataObjectWithDetailDataType {
  return 'objectData' in obj && 'inheritanceData' in obj;
}

export function isDataObject(obj: any): obj is DataObjectType {
  return 'className' in obj && 'published' in obj && obj.type !== 'folder';
}
