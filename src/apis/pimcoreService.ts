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
      return response.data.items || response.data;
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
   * Fetch data objects by class
   * Endpoint: GET /pimcore-studio/api/data-objects (with filtering)
   * Note: Actual endpoint structure may vary, check API docs for pagination
   */
  static async getDataObjects(
    classId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PimcoreListResponse<PimcoreDataObject>> {
    try {
      const apiClient = getApiClient();
      // Note: The exact query parameters depend on the grid configuration
      // This is a simplified version
      const response = await apiClient.get('/data-objects', {
        params: {
          classId,
          page,
          pageSize: limit,
        },
      });
      return {
        data: response.data.items || response.data,
        total: response.data.totalItems || response.data.length,
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
