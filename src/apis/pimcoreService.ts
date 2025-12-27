/**
 * Pimcore API Service
 * Handles communication with Pimcore Studio API
 * Based on Pimcore Studio API OpenAPI specification v0.10.21
 * API Base Path: /pimcore-studio/api
 */

import { getApiClient } from './apiClient';
import {
  PimcoreClassDefinition,
  PimcoreDataObject,
  PimcoreListResponse,
} from '../types/pimcore';

export class PimcoreService {
  /**
   * Fetch all class definitions from Pimcore Studio API
   * Endpoint: GET /pimcore-studio/api/class/collection
   */
  static async getClassDefinitions(): Promise<PimcoreClassDefinition[]> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get('/class/collection');
      
      // Handle different response structures
      let items = response.data.items || response.data || [];
      
      // Ensure each item has the expected structure
      items = items.map((item: any) => ({
        id: item.id || item.name || '',
        name: item.name || item.id || '',
        description: item.description || '',
        fields: item.fields || [],
      }));
      
      return items;
    } catch (error) {
      console.error('Error fetching class definitions:', error);
      // Return mock data for development
      return this.getMockClassDefinitions();
    }
  }

  /**
   * Fetch a specific class definition
   * Endpoint: GET /pimcore-studio/api/class/definition/{dataObjectClass}
   */
  static async getClassDefinition(classId: string): Promise<PimcoreClassDefinition> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/class/definition/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class definition:', error);
      throw error;
    }
  }

  /**
   * Fetch data objects by class using tree endpoint
   * Endpoint: GET /pimcore-studio/api/data-objects/tree
   * This endpoint provides tree structure with folders and data objects
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
        // Don't set excludeFolders - let API return both folders and objects
      };
      
      // Add parentId filter if provided (required for navigating tree structure)
      if (parentId !== undefined && parentId !== null) {
        params.parentId = parentId;
      }
      
      // Only add classIds filter if classId is provided and not for root level
      // This allows showing all items in folders
      if (classId && parentId === undefined) {
        params.classIds = JSON.stringify([classId]);
      }
      
      const response = await apiClient.get('/data-objects/tree', {
        params,
      });
      
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
   * Update a data object
   * Endpoint: PATCH /pimcore-studio/api/data-objects
   * Note: Based on OpenAPI spec, PATCH is used for updates
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
   * @param parentId - Parent folder/object ID (required by Pimcore Studio API)
   * @param data - Object data with class-specific fields
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
   * Note: Pimcore uses batch delete, so we wrap single ID in array
   */
  static async deleteDataObject(id: number): Promise<void> {
    try {
      const apiClient = getApiClient();
      await apiClient.delete('/data-objects/batch-delete', {
        data: {
          ids: [id],
        },
      });
    } catch (error) {
      console.error('Error deleting data object:', error);
      throw error;
    }
  }

  /**
   * Batch delete multiple data objects
   * Endpoint: DELETE /pimcore-studio/api/data-objects/batch-delete
   * @param ids - Array of data object IDs to delete
   * @returns Promise with jobRun ID (async operation)
   */
  static async batchDeleteDataObjects(ids: number[]): Promise<{ jobRunId?: string }> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.delete('/data-objects/batch-delete', {
        data: {
          ids,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error batch deleting data objects:', error);
      throw error;
    }
  }

  /**
   * Get classes available in a folder
   * Endpoint: GET /pimcore-studio/api/class/folder/{folderId}
   * Returns list of class objects that have objects in this folder
   */
  static async getFolderClasses(folderId: number): Promise<Array<{id: string, name: string}>> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/class/folder/${folderId}`);
      console.log('getFolderClasses response:', response.data);
      
      // Handle different response structures
      if (response.data.items && Array.isArray(response.data.items)) {
        return response.data.items;
      } else if (response.data.classes && Array.isArray(response.data.classes)) {
        return response.data.classes;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching folder classes:', error);
      return [];
    }
  }

  /**
   * Get grid configuration and data for a specific class in a folder
   * Endpoint: GET /pimcore-studio/api/data-object/grid/configuration/{id}/{classId}
   * @param folderId - Folder ID
   * @param classId - Class ID
   * @param page - Page number (default: 1)
   * @param limit - Items per page (default: 10)
   */
  static async getGridConfiguration(
    folderId: number,
    classId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<any> {
    try {
      const apiClient = getApiClient();
      console.log(`Fetching grid configuration for folder ${folderId}, class ${classId}`);
      const response = await apiClient.get(
        `/data-object/grid/configuration/${folderId}/${classId}`,
        {
          params: {
            page,
            pageSize: limit,
          },
        }
      );
      console.log('Grid configuration response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching grid configuration:', error);
      // Return empty result instead of throwing
      return { items: [], data: [], total: 0 };
    }
  }

  /**
   * Get tree structure starting from root or specific parent
   * Only loads one level (lazy loading for deep trees)
   * Endpoint: GET /pimcore-studio/api/data-objects/tree
   */
  static async getTreeLevel(parentId: number = 1): Promise<PimcoreDataObject[]> {
    try {
      const apiClient = getApiClient();
      const params: any = {
        parentId,
        pageSize: 1000, // Load many items at this level
        // No excludeFolders - get everything
      };
      
      const response = await apiClient.get('/data-objects/tree', {
        params,
      });
      
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching tree level:', error);
      return [];
    }
  }

  /**
   * Mock class definitions for development
   */
  private static getMockClassDefinitions(): PimcoreClassDefinition[] {
    return [
      {
        id: 'Product',
        name: 'Product',
        description: 'Product data class',
        fields: [
          { name: 'name', title: 'Product Name', type: 'input', mandatory: true },
          { name: 'sku', title: 'SKU', type: 'input', mandatory: true },
          { name: 'price', title: 'Price', type: 'numeric', mandatory: true },
          { name: 'description', title: 'Description', type: 'textarea' },
        ],
      },
      {
        id: 'Category',
        name: 'Category',
        description: 'Category data class',
        fields: [
          { name: 'name', title: 'Category Name', type: 'input', mandatory: true },
          { name: 'description', title: 'Description', type: 'textarea' },
        ],
      },
    ];
  }
}
