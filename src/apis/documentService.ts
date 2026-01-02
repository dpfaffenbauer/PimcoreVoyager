/**
 * Document Service
 * Handles all document related API calls
 */

import { getApiClient } from './apiClient';

export class DocumentService {
  /**
   * Get document tree structure starting from root or specific parent
   * Endpoint: GET /pimcore-studio/api/documents/tree
   */
  static async getDocumentTreeLevel(parentId: number = 1): Promise<any[]> {
    try {
      const apiClient = getApiClient();
      const params: any = {
        parentId,
        page: 1,
        pageSize: 100,
      };

      const response = await apiClient.get('/documents/tree', { params });
      console.log('Document tree response:', response.data);
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching document tree level:', error);
      return [];
    }
  }

  /**
   * Get a single document by ID
   * Endpoint: GET /pimcore-studio/api/documents/{id}
   */
  static async getDocument(id: number): Promise<any> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get(`/documents/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  }

  /**
   * Publish or unpublish a document
   * Endpoint: PUT /pimcore-studio/api/documents/{id}
   */
  static async setDocumentPublishState(id: number, publish: boolean): Promise<any> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.put(`/documents/${id}`, {
        data: {
          task: publish ? 'publish' : 'unpublish',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error setting document publish state:', error);
      throw error;
    }
  }
}
