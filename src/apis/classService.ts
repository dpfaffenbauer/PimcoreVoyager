/**
 * Class Service
 * Handles all class definition related API calls
 */

import { getApiClient } from './apiClient';
import { PimcoreClassDefinition } from '../types/pimcore';

export class ClassService {
  /**
   * Fetch all class definitions from Pimcore Studio API
   * Endpoint: GET /pimcore-studio/api/class/collection
   */
  static async getClassDefinitions(): Promise<PimcoreClassDefinition[]> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get('/class/collection');

      let items = response.data.items || response.data || [];

      items = items.map((item: any) => ({
        id: item.id || item.name || '',
        name: item.name || item.id || '',
        description: item.description || '',
        fields: item.fields || [],
      }));

      return items;
    } catch (error) {
      console.error('Error fetching class definitions:', error);
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
   * Get classes available in a folder
   * Endpoint: GET /pimcore-studio/api/class/folder/{folderId}
   */
  static async getFolderClasses(folderId: number): Promise<Array<{ id: string; name: string }>> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/class/folder/${folderId}`);
      console.log('getFolderClasses response:', response.data);

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
   * Fetch field collection layout definitions for an object
   * Endpoint: GET /pimcore-studio/api/class/field-collection/{objectId}/object/layout
   */
  static async getFieldCollectionLayouts(objectId: number): Promise<any> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/class/field-collection/${objectId}/object/layout`);
      console.log('Field collection layouts:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching field collection layouts:', error);
      return {};
    }
  }

  /**
   * Fetch object brick layout definitions for an object
   * Endpoint: GET /pimcore-studio/api/class/object-brick/{objectId}/object/layout
   */
  static async getObjectBrickLayouts(objectId: number): Promise<any> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/class/object-brick/${objectId}/object/layout`);
      console.log('Object brick layouts:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching object brick layouts:', error);
      return {};
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
