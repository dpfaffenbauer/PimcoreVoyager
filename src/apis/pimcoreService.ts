/**
 * Pimcore API Service
 * Re-exports all services for backwards compatibility
 *
 * Individual services:
 * - DataObjectService: Data object operations
 * - AssetService: Asset operations
 * - DocumentService: Document operations
 * - ClassService: Class definition operations
 * - WorkflowService: Workflow operations
 */

// Re-export individual services
export { DataObjectService } from './dataObjectService';
export { AssetService } from './assetService';
export { DocumentService } from './documentService';
export { ClassService } from './classService';
export { WorkflowService } from './workflowService';
export { PropertiesService } from './propertiesService';

// Re-export properties types
export type {
  ElementProperty,
  PropertyType,
  ElementType as PropertyElementType,
} from './propertiesService';

// Re-export workflow types
export type {
  WorkflowStatus,
  WorkflowTransition,
  WorkflowGlobalAction,
  WorkflowItem,
  WorkflowDetails,
  WorkflowActionResponse,
  WorkflowNotes,
  WorkflowAdditionalField,
  WorkflowAdditionalFieldType,
  WorkflowSelectOption,
} from './workflowService';

// Import services for PimcoreService facade
import { DataObjectService } from './dataObjectService';
import { AssetService } from './assetService';
import { DocumentService } from './documentService';
import { ClassService } from './classService';
import { WorkflowService } from './workflowService';
import { PropertiesService } from './propertiesService';

/**
 * PimcoreService - Facade class for backwards compatibility
 * Delegates all calls to individual services
 */
export class PimcoreService {
  // Class methods
  static getClassDefinitions = ClassService.getClassDefinitions;
  static getClassDefinition = ClassService.getClassDefinition;
  static getFolderClasses = ClassService.getFolderClasses;
  static getFieldCollectionLayouts = ClassService.getFieldCollectionLayouts;
  static getObjectBrickLayouts = ClassService.getObjectBrickLayouts;

  // Data Object methods
  static getDataObjects = DataObjectService.getDataObjects;
  static getDataObject = DataObjectService.getDataObject;
  static getDataObjectFull = DataObjectService.getDataObjectFull;
  static getDataObjectLayout = DataObjectService.getDataObjectLayout;
  static updateDataObject = DataObjectService.updateDataObject;
  static createDataObject = DataObjectService.createDataObject;
  static deleteDataObject = DataObjectService.deleteDataObject;
  static batchDeleteDataObjects = DataObjectService.batchDeleteDataObjects;
  static setDataObjectPublishState = DataObjectService.setDataObjectPublishState;
  static getTreeLevel = DataObjectService.getTreeLevel;
  static getGridConfiguration = DataObjectService.getGridConfiguration;

  // Asset methods
  static getAssetTreeLevel = AssetService.getAssetTreeLevel;
  static getAsset = AssetService.getAsset;
  static getFolderAssets = AssetService.getFolderAssets;

  // Document methods
  static getDocumentTreeLevel = DocumentService.getDocumentTreeLevel;
  static getDocument = DocumentService.getDocument;
  static setDocumentPublishState = DocumentService.setDocumentPublishState;

  // Workflow methods
  static getWorkflowDetails = WorkflowService.getWorkflowDetails;
  static triggerWorkflowAction = WorkflowService.triggerWorkflowAction;

  // Properties methods
  static getElementProperties = PropertiesService.getElementProperties;
}
