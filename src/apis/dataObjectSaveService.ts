/**
 * Data Object Save Service
 * Handles saving/publishing data objects with proper field data formatting
 */

import { getApiClient } from './apiClient';

export type SaveTask = 'save' | 'publish' | 'unpublish' | 'autoSave' | 'version';

export interface SaveOptions {
  task?: SaveTask;
  /** Only send modified fields (default: true) */
  partial?: boolean;
}

export interface SaveResult {
  success: boolean;
  id: number;
  modificationDate?: number;
  versionId?: number;
  message?: string;
  errors?: Record<string, string>;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Format field value for API submission
 * Handles special field types that need specific formatting
 */
function formatFieldValue(fieldType: string, value: any): any {
  if (value === null || value === undefined) {
    return null;
  }

  switch (fieldType) {
    case 'date':
    case 'datetime':
      // Convert Date objects to Unix timestamp
      if (value instanceof Date) {
        return Math.floor(value.getTime() / 1000);
      }
      // Already a timestamp or string
      return value;

    case 'time':
      // Time should be HH:MM:SS format
      if (value instanceof Date) {
        return value.toTimeString().split(' ')[0];
      }
      return value;

    case 'checkbox':
      // Ensure boolean
      return Boolean(value);

    case 'numeric':
    case 'slider':
      // Ensure number
      return typeof value === 'string' ? parseFloat(value) : value;

    case 'quantityValue':
      // Should be { value: number, unitId: string }
      if (typeof value === 'object' && value !== null) {
        return {
          value: parseFloat(value.value) || 0,
          unitId: value.unitId || null,
        };
      }
      return value;

    case 'manyToOneRelation':
      // Should be { id: number, type: string }
      if (typeof value === 'object' && value !== null) {
        return {
          id: value.id,
          type: value.type || 'object',
        };
      }
      return value;

    case 'manyToManyRelation':
    case 'manyToManyObjectRelation':
    case 'advancedManyToManyRelation':
    case 'advancedManyToManyObjectRelation':
      // Should be array of { id: number, type: string }
      if (Array.isArray(value)) {
        return value.map(item => ({
          id: item.id,
          type: item.type || 'object',
        }));
      }
      return value;

    case 'image':
    case 'video':
      // Should be asset ID or null
      if (typeof value === 'object' && value !== null) {
        return value.id || null;
      }
      return value;

    case 'imageGallery':
      // Should be array of asset IDs
      if (Array.isArray(value)) {
        return value.map(item => {
          if (typeof item === 'object' && item !== null) {
            return item.id;
          }
          return item;
        });
      }
      return value;

    case 'geopoint':
      // Should be { latitude: number, longitude: number }
      return value;

    case 'geobounds':
      // Should be { northEast: { lat, lng }, southWest: { lat, lng } }
      return value;

    case 'geopolygon':
      // Should be array of { lat, lng }
      return value;

    case 'link':
      // Should match Link structure
      if (typeof value === 'object' && value !== null) {
        return {
          text: value.text || '',
          path: value.path || value.href || '',
          target: value.target || '',
          parameters: value.parameters || '',
          anchor: value.anchor || '',
          title: value.title || '',
          accesskey: value.accesskey || '',
          rel: value.rel || '',
          tabindex: value.tabindex || '',
          class: value.class || '',
          attributes: value.attributes || '',
          internal: value.internal || false,
          internalType: value.internalType,
          internalId: value.internalId,
        };
      }
      return value;

    case 'rgbaColor':
      // Should be hex string or RGBA object
      return value;

    case 'localizedfields':
      // Nested structure with language keys
      return value;

    case 'fieldcollections':
      // Array of { type: string, data: {} }
      if (Array.isArray(value)) {
        return value.map(item => ({
          type: item.type,
          data: item.data,
        }));
      }
      return value;

    case 'objectbricks':
      // Object with brick data
      return value;

    case 'block':
      // Array of block items
      return value;

    default:
      // Return as-is for text, select, multiselect, etc.
      return value;
  }
}

/**
 * Validate required fields before save
 */
function validateRequiredFields(
  data: Record<string, any>,
  fieldDefinitions: Record<string, { mandatory?: boolean; title?: string }>
): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const [fieldName, fieldDef] of Object.entries(fieldDefinitions)) {
    if (fieldDef.mandatory) {
      const value = data[fieldName];
      if (value === null || value === undefined || value === '') {
        errors.push({
          field: fieldName,
          message: `${fieldDef.title || fieldName} ist ein Pflichtfeld`,
        });
      }
    }
  }

  return errors;
}

export class DataObjectSaveService {
  /**
   * Save a data object with field data
   * Endpoint: PUT /pimcore-studio/api/data-objects/{id}
   */
  static async saveDataObject(
    id: number,
    editableData: Record<string, any>,
    options: SaveOptions = {}
  ): Promise<SaveResult> {
    const { task = 'save', partial = true } = options;

    try {
      const apiClient = getApiClient();

      // Format the data for the API
      const formattedData: Record<string, any> = {};
      for (const [key, value] of Object.entries(editableData)) {
        // Try to determine field type from the key or value structure
        // In a real implementation, we'd have access to field definitions
        formattedData[key] = value;
      }

      const payload = {
        data: formattedData,
        task: task,
      };

      console.log(`Saving data object ${id} with task: ${task}`, payload);

      const response = await apiClient.put(`/data-objects/${id}`, payload);

      return {
        success: true,
        id: response.data.id || id,
        modificationDate: response.data.modificationDate,
        versionId: response.data.versionId,
        message: task === 'publish' ? 'Objekt veröffentlicht' : 'Änderungen gespeichert',
      };
    } catch (error: any) {
      console.error('Error saving data object:', error);

      // Parse validation errors from API response
      const errors: Record<string, string> = {};
      if (error.response?.data?.errors) {
        for (const err of error.response.data.errors) {
          if (err.field) {
            errors[err.field] = err.message || 'Ungültiger Wert';
          }
        }
      }

      return {
        success: false,
        id,
        message: error.response?.data?.message || 'Fehler beim Speichern',
        errors: Object.keys(errors).length > 0 ? errors : undefined,
      };
    }
  }

  /**
   * Publish a data object
   */
  static async publishDataObject(
    id: number,
    editableData: Record<string, any>
  ): Promise<SaveResult> {
    return this.saveDataObject(id, editableData, { task: 'publish' });
  }

  /**
   * Unpublish a data object
   */
  static async unpublishDataObject(id: number): Promise<SaveResult> {
    return this.saveDataObject(id, {}, { task: 'unpublish' });
  }

  /**
   * Auto-save a data object (draft)
   */
  static async autoSaveDataObject(
    id: number,
    editableData: Record<string, any>
  ): Promise<SaveResult> {
    return this.saveDataObject(id, editableData, { task: 'autoSave' });
  }

  /**
   * Create a version without publishing
   */
  static async createVersion(
    id: number,
    editableData: Record<string, any>
  ): Promise<SaveResult> {
    return this.saveDataObject(id, editableData, { task: 'version' });
  }

  /**
   * Validate field data before save
   */
  static validateFields(
    data: Record<string, any>,
    fieldDefinitions: Record<string, { mandatory?: boolean; title?: string; fieldtype?: string }>
  ): { valid: boolean; errors: ValidationError[] } {
    const errors = validateRequiredFields(data, fieldDefinitions);
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Format field data for API submission
   */
  static formatFieldData(
    data: Record<string, any>,
    fieldDefinitions: Record<string, { fieldtype: string }>
  ): Record<string, any> {
    const formatted: Record<string, any> = {};

    for (const [key, value] of Object.entries(data)) {
      const fieldDef = fieldDefinitions[key];
      const fieldType = fieldDef?.fieldtype || 'input';
      formatted[key] = formatFieldValue(fieldType, value);
    }

    return formatted;
  }
}
