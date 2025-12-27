/**
 * Pimcore API Service
 * Handles communication with Pimcore Studio API
 * API Documentation: Pimcore Studio API endpoints
 */

import apiClient from './apiClient';
import {
  PimcoreClassDefinition,
  PimcoreDataObject,
  PimcoreListResponse,
} from '../types/pimcore';

export class PimcoreService {
  /**
   * Fetch all class definitions from Pimcore Studio API
   * Endpoint: GET /studio/api/data-objects/classes
   */
  static async getClassDefinitions(): Promise<PimcoreClassDefinition[]> {
    try {
      const response = await apiClient.get('/data-objects/classes');
      return response.data.items || response.data;
    } catch (error) {
      console.error('Error fetching class definitions:', error);
      // Return mock data for development
      return this.getMockClassDefinitions();
    }
  }

  /**
   * Fetch a specific class definition
   * Endpoint: GET /studio/api/data-objects/classes/{id}
   */
  static async getClassDefinition(classId: string): Promise<PimcoreClassDefinition> {
    try {
      const response = await apiClient.get(`/data-objects/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class definition:', error);
      throw error;
    }
  }

  /**
   * Fetch data objects by class
   * Endpoint: GET /studio/api/data-objects
   */
  static async getDataObjects(
    className: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PimcoreListResponse<PimcoreDataObject>> {
    try {
      const response = await apiClient.get('/data-objects', {
        params: {
          classId: className,
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
   * Endpoint: GET /studio/api/data-objects/{id}
   */
  static async getDataObject(id: number): Promise<PimcoreDataObject> {
    try {
      const response = await apiClient.get(`/data-objects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching data object:', error);
      throw error;
    }
  }

  /**
   * Update a data object
   * Endpoint: PATCH /studio/api/data-objects/{id}
   */
  static async updateDataObject(
    id: number,
    data: Partial<PimcoreDataObject>
  ): Promise<PimcoreDataObject> {
    try {
      const response = await apiClient.patch(`/data-objects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating data object:', error);
      throw error;
    }
  }

  /**
   * Create a new data object
   * Endpoint: POST /studio/api/data-objects
   */
  static async createDataObject(
    data: Partial<PimcoreDataObject>
  ): Promise<PimcoreDataObject> {
    try {
      const response = await apiClient.post('/data-objects', data);
      return response.data;
    } catch (error) {
      console.error('Error creating data object:', error);
      throw error;
    }
  }

  /**
   * Delete a data object
   * Endpoint: DELETE /studio/api/data-objects/{id}
   */
  static async deleteDataObject(id: number): Promise<void> {
    try {
      await apiClient.delete(`/data-objects/${id}`);
    } catch (error) {
      console.error('Error deleting data object:', error);
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
