/**
 * Pimcore API Service
 * Handles communication with Pimcore REST/GraphQL APIs
 */

import apiClient from './apiClient';
import {
  PimcoreClassDefinition,
  PimcoreDataObject,
  PimcoreListResponse,
} from '../types/pimcore';

export class PimcoreService {
  /**
   * Fetch all class definitions from Pimcore
   */
  static async getClassDefinitions(): Promise<PimcoreClassDefinition[]> {
    try {
      const response = await apiClient.get('/classes');
      return response.data;
    } catch (error) {
      console.error('Error fetching class definitions:', error);
      // Return mock data for development
      return this.getMockClassDefinitions();
    }
  }

  /**
   * Fetch a specific class definition
   */
  static async getClassDefinition(classId: string): Promise<PimcoreClassDefinition> {
    try {
      const response = await apiClient.get(`/classes/${classId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching class definition:', error);
      throw error;
    }
  }

  /**
   * Fetch data objects by class
   */
  static async getDataObjects(
    className: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PimcoreListResponse<PimcoreDataObject>> {
    try {
      const response = await apiClient.get('/objects', {
        params: {
          className,
          page,
          limit,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching data objects:', error);
      return { data: [], total: 0 };
    }
  }

  /**
   * Fetch a single data object by ID
   */
  static async getDataObject(id: number): Promise<PimcoreDataObject> {
    try {
      const response = await apiClient.get(`/objects/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching data object:', error);
      throw error;
    }
  }

  /**
   * Update a data object
   */
  static async updateDataObject(
    id: number,
    data: Partial<PimcoreDataObject>
  ): Promise<PimcoreDataObject> {
    try {
      const response = await apiClient.put(`/objects/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating data object:', error);
      throw error;
    }
  }

  /**
   * Create a new data object
   */
  static async createDataObject(
    data: Partial<PimcoreDataObject>
  ): Promise<PimcoreDataObject> {
    try {
      const response = await apiClient.post('/objects', data);
      return response.data;
    } catch (error) {
      console.error('Error creating data object:', error);
      throw error;
    }
  }

  /**
   * Delete a data object
   */
  static async deleteDataObject(id: number): Promise<void> {
    try {
      await apiClient.delete(`/objects/${id}`);
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
