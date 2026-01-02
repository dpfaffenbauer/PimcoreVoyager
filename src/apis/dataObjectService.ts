/**
 * Data Object Service
 * Handles all data object related API calls
 */

import { getApiClient } from './apiClient';
import { PimcoreDataObject, PimcoreListResponse } from '../types/pimcore';

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
  ): Promise<PimcoreListResponse<PimcoreDataObject>> {
    try {
      const apiClient = getApiClient();
      const params: any = {
        page,
        pageSize: limit,
      };

      if (parentId !== undefined && parentId !== null) {
        params.parentId = parentId;
      }

      if (classId && parentId === undefined) {
        params.classIds = JSON.stringify([classId]);
      }

      const response = await apiClient.get('/data-objects/tree', { params });

      return {
        data: response.data.items || [],
        total: response.data.totalItems || 0,
      };
    } catch (error) {
      console.error('Error fetching data objects:', error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Fetch a single data object by ID
   * Endpoint: GET /pimcore-studio/api/data-objects/{id}
   */
  static async getDataObject(id: number): Promise<PimcoreDataObject> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/data-objects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching data object:', error);
      throw error;
    }
  }

  /**
   * Fetch full data object with objectData (field values)
   * Endpoint: GET /pimcore-studio/api/data-objects/{id}
   */
  static async getDataObjectFull(id: number): Promise<any> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/data-objects/${id}`);
      console.log('Full object data:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching full data object:', error);
      throw error;
    }
  }

  /**
   * Fetch layout definition for a data object
   * Endpoint: GET /pimcore-studio/api/data-objects/{id}/layout
   */
  static async getDataObjectLayout(id: number): Promise<any> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/data-objects/${id}/layout`);
      console.log('Object layout:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching data object layout:', error);
      throw error;
    }
  }

  /**
   * Update a data object
   * Endpoint: PATCH /pimcore-studio/api/data-objects
   */
  static async updateDataObject(
    id: number,
    data: Partial<PimcoreDataObject>
  ): Promise<PimcoreDataObject> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.patch('/data-objects', {
        id,
        ...data,
      });
      return response.data;
    } catch (error) {
      console.error('Error updating data object:', error);
      throw error;
    }
  }

  /**
   * Create a new data object
   * Endpoint: POST /pimcore-studio/api/data-objects/add/{parentId}
   */
  static async createDataObject(
    parentId: number,
    data: Partial<PimcoreDataObject>
  ): Promise<PimcoreDataObject> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.post(`/data-objects/add/${parentId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error creating data object:', error);
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
      console.error('Error deleting data object:', error);
      throw error;
    }
  }

  /**
   * Batch delete multiple data objects
   * Endpoint: DELETE /pimcore-studio/api/data-objects/batch-delete
   */
  static async batchDeleteDataObjects(ids: number[]): Promise<{ jobRunId?: string }> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.delete('/data-objects/batch-delete', {
        data: { ids },
      });
      return response.data;
    } catch (error) {
      console.error('Error batch deleting data objects:', error);
      throw error;
    }
  }

  /**
   * Publish or unpublish a data object
   * Endpoint: PUT /pimcore-studio/api/data-objects/{id}
   */
  static async setDataObjectPublishState(id: number, publish: boolean): Promise<any> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.put(`/data-objects/${id}`, {
        data: {
          task: publish ? 'publish' : 'unpublish',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error setting data object publish state:', error);
      throw error;
    }
  }

  /**
   * Get tree structure starting from root or specific parent
   * Endpoint: GET /pimcore-studio/api/data-objects/tree
   */
  static async getTreeLevel(parentId: number = 1): Promise<PimcoreDataObject[]> {
    try {
      const apiClient = getApiClient();
      const params: any = {
        parentId,
        pageSize: 1000,
      };

      const response = await apiClient.get('/data-objects/tree', { params });
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching tree level:', error);
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
  ): Promise<any> {
    try {
      const apiClient = getApiClient();
      console.log(`Fetching grid data for class ${classId} in folder ${folderId}`);

      const columns = [
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

      const response = await apiClient.post(`/data-objects/grid/${classId}`, {
        folderId: folderId,
        columns: columns,
        filters: {
          includeDescendants: true,
          page: page,
          pageSize: limit,
          columnFilters: [],
        },
      });
      console.log('Grid response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching grid data:', error);
      return { items: [], data: [], total: 0 };
    }
  }
}
