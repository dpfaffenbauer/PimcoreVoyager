/**
 * Data Object Service
 * Handles all data object related API calls
 *
 * Uses types from @pimcore/studio-ui-bundle for API consistency
 */

import { getApiClient } from './apiClient';
import type {
  DataObject,
  DataObjectFolder,
  DataObjectWithDetailData,
  DataObjectGetByIdApiResponse,
  DataObjectGetTreeApiResponse,
  DataObjectGetTreeApiArg,
  DataObjectUpdateByIdApiArg,
  DataObjectAddApiArg,
  DataObjectAddApiResponse,
  DataObjectBatchDeleteApiResponse,
  DataObjectGetGridApiResponse,
  GridColumnRequest,
  Layout,
} from '../types/pimcore';

// Legacy response type for backwards compatibility
export interface DataObjectListResponse<T> {
  data: T[];
  total: number;
}

export class DataObjectService {
  /**
   * Fetch data objects by class using tree endpoint
   * Endpoint: GET /pimcore-studio/api/data-objects/tree
   */
  static async getDataObjects(
    classId?: string,
    page: number = 1,
    limit: number = 100,
    parentId?: number
  ): Promise<DataObjectListResponse<DataObject | DataObjectFolder>> {
    try {
      const apiClient = getApiClient();
      const params: Partial<DataObjectGetTreeApiArg> = {
        page,
        pageSize: limit,
      };

      if (parentId !== undefined && parentId !== null) {
        params.parentId = parentId;
      }

      if (classId && parentId === undefined) {
        params.classIds = JSON.stringify([classId]);
      }

      const response = await apiClient.get<DataObjectGetTreeApiResponse>('/data-objects/tree', { params });

      return {
        data: response.data.items || [],
        total: response.data.totalItems || 0,
      };
    } catch (error) {
      return { data: [], total: 0 };
    }
  }

  /**
   * Fetch a single data object by ID
   * Endpoint: GET /pimcore-studio/api/data-objects/{id}
   */
  static async getDataObject(id: number): Promise<DataObjectGetByIdApiResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get<DataObjectGetByIdApiResponse>(`/data-objects/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch full data object with objectData (field values)
   * Endpoint: GET /pimcore-studio/api/data-objects/{id}
   */
  static async getDataObjectFull(id: number): Promise<DataObjectWithDetailData | DataObjectFolder> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get<DataObjectGetByIdApiResponse>(`/data-objects/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Fetch layout definition for a data object
   * Endpoint: GET /pimcore-studio/api/data-objects/{id}/layout
   */
  static async getDataObjectLayout(id: number): Promise<Layout> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get<Layout>(`/data-objects/${id}/layout`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a data object
   * Endpoint: PUT /pimcore-studio/api/data-objects/{id}
   */
  static async updateDataObject(
    id: number,
    data: DataObjectUpdateByIdApiArg['body']['data']
  ): Promise<DataObjectGetByIdApiResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.put<DataObjectGetByIdApiResponse>(`/data-objects/${id}`, {
        data,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create a new data object
   * Endpoint: POST /pimcore-studio/api/data-objects/add/{parentId}
   */
  static async createDataObject(
    parentId: number,
    data: DataObjectAddApiArg['dataObjectAddParameters']
  ): Promise<DataObjectAddApiResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.post<DataObjectAddApiResponse>(`/data-objects/add/${parentId}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a data object
   * Endpoint: DELETE /pimcore-studio/api/data-objects/batch-delete
   */
  static async deleteDataObject(id: number): Promise<void> {
    try {
      const apiClient = getApiClient();
      await apiClient.delete('/data-objects/batch-delete', {
        data: { ids: [id] },
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Batch delete multiple data objects
   * Endpoint: DELETE /pimcore-studio/api/data-objects/batch-delete
   */
  static async batchDeleteDataObjects(ids: number[]): Promise<DataObjectBatchDeleteApiResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.delete<DataObjectBatchDeleteApiResponse>('/data-objects/batch-delete', {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Publish or unpublish a data object
   * Endpoint: PUT /pimcore-studio/api/data-objects/{id}
   */
  static async setDataObjectPublishState(
    id: number,
    publish: boolean
  ): Promise<DataObjectGetByIdApiResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.put<DataObjectGetByIdApiResponse>(`/data-objects/${id}`, {
        data: {
          task: publish ? 'publish' : 'unpublish',
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Save data object field values
   * Endpoint: PUT /pimcore-studio/api/data-objects/{id}
   *
   * Pimcore Studio API expects:
   * {
   *   "data": {
   *     "editableData": { ... field values ... },
   *     "task": "save" | "publish",
   *     "useDraftData": true
   *   }
   * }
   *
   * @param id - The object ID
   * @param fieldData - The modified field values (already in correct structure)
   * @param options - Save options (task: 'save' | 'publish')
   * @returns The updated object data
   */
  static async saveDataObject(
    id: number,
    fieldData: Record<string, unknown>,
    options: { task: 'save' | 'publish' } = { task: 'save' }
  ): Promise<DataObjectGetByIdApiResponse> {
    try {
      const apiClient = getApiClient();

      // Transform field data to the format Pimcore Studio expects
      // Structure: { data: { editableData: {...}, task: "save|publish", useDraftData: true } }
      const payload: { data: DataObjectUpdateByIdApiArg['body']['data'] } = {
        data: {
          editableData: fieldData,
          task: options.task,
          useDraftData: true,
        },
      };

      console.log('Saving data object:', id, 'with payload:', JSON.stringify(payload, null, 2));

      const response = await apiClient.put<DataObjectGetByIdApiResponse>(`/data-objects/${id}`, payload);

      console.log('Save response:', response.data);
      return response.data;
    } catch (error: unknown) {
      console.error('Error saving data object:', error);

      // Type-safe error handling
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { errors?: Record<string, string>; message?: string } } };

        // Extract validation errors if present
        if (axiosError.response?.data?.errors) {
          const validationErrors = axiosError.response.data.errors;
          const errorMessage = Object.entries(validationErrors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(', ');
          throw new Error(`Validation error: ${errorMessage}`);
        }

        // Check for API error message
        if (axiosError.response?.data?.message) {
          throw new Error(axiosError.response.data.message);
        }
      }

      throw error;
    }
  }

  /**
   * Get tree structure starting from root or specific parent
   * Endpoint: GET /pimcore-studio/api/data-objects/tree
   */
  static async getTreeLevel(parentId: number = 1): Promise<(DataObject | DataObjectFolder)[]> {
    try {
      const apiClient = getApiClient();
      const params: Partial<DataObjectGetTreeApiArg> = {
        parentId,
        pageSize: 1000,
      };

      const response = await apiClient.get<DataObjectGetTreeApiResponse>('/data-objects/tree', { params });
      return response.data.items || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Get grid data for a specific class
   * Endpoint: POST /pimcore-studio/api/data-objects/grid/{classId}
   */
  static async getGridConfiguration(
    folderId: number,
    classId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<DataObjectGetGridApiResponse> {
    try {
      const apiClient = getApiClient();

      const columns: GridColumnRequest[] = [
        { key: 'id', type: 'system.id', group: ['system'], config: [] },
        { key: 'key', type: 'system.string', group: ['system'], config: [] },
        { key: 'fullpath', type: 'system.string', group: ['system'], config: [] },
        { key: 'published', type: 'system.boolean', group: ['system'], config: [] },
        { key: 'filename', type: 'system.string', group: ['system'], config: [] },
        { key: 'classname', type: 'system.string', group: ['system'], config: [] },
        { key: 'creationDate', type: 'system.datetime', group: ['system'], config: [] },
        { key: 'modificationDate', type: 'system.datetime', group: ['system'], config: [] },
        { key: 'type', type: 'system.string', group: ['system'], config: [] },
      ];

      const response = await apiClient.post<DataObjectGetGridApiResponse>(`/data-objects/grid/${classId}`, {
        folderId: folderId,
        columns: columns,
        filters: {
          includeDescendants: true,
          page: page,
          pageSize: limit,
          columnFilters: [],
        },
      });
      return response.data;
    } catch (error) {
      return { items: [], totalItems: 0 };
    }
  }
}
