/**
 * Tags Service
 * Handles tag operations for all element types (data-objects, assets, documents)
 */

import { getApiClient } from './apiClient';

export interface Tag {
  id: number;
  parentId: number;
  hasChildren: boolean;
  path: string;
  text: string;
  children: Tag[];
  iconName: string;
  additionalAttributes: any[];
}

export interface ElementTagsResponse {
  totalItems: number;
  items: Tag[];
}

export interface AllTagsResponse {
  items: Tag[];
}

export type ElementType = 'data-object' | 'asset' | 'document';

export class TagsService {
  /**
   * Get tags assigned to an element
   * GET /tags/{elementType}/{elementId}
   */
  static async getElementTags(elementType: ElementType, elementId: number): Promise<ElementTagsResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get<ElementTagsResponse>(`/tags/${elementType}/${elementId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching element tags:', error);
      throw error;
    }
  }

  /**
   * Get all available tags (hierarchical)
   * GET /tags?page=1&pageSize=9999&filter=
   */
  static async getAllTags(filter: string = ''): Promise<AllTagsResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get<AllTagsResponse>('/tags', {
        params: {
          page: 1,
          pageSize: 9999,
          filter,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all tags:', error);
      throw error;
    }
  }

  /**
   * Assign a tag to an element
   * POST /tags/assign/{elementType}/{elementId}/{tagId}
   */
  static async assignTag(elementType: ElementType, elementId: number, tagId: number): Promise<void> {
    try {
      const apiClient = getApiClient();
      await apiClient.post(`/tags/assign/${elementType}/${elementId}/${tagId}`);
    } catch (error) {
      console.error('Error assigning tag:', error);
      throw error;
    }
  }

  /**
   * Remove a tag from an element
   * DELETE /tags/{elementType}/{elementId}/{tagId}
   */
  static async removeTag(elementType: ElementType, elementId: number, tagId: number): Promise<void> {
    try {
      const apiClient = getApiClient();
      await apiClient.delete(`/tags/${elementType}/${elementId}/${tagId}`);
    } catch (error) {
      console.error('Error removing tag:', error);
      throw error;
    }
  }
}
