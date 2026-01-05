/**
 * Tags Service
 * Handles tag operations for all element types (data-objects, assets, documents)
 * Types based on Pimcore Studio API (@pimcore/studio-ui-bundle)
 */

import { getApiClient } from './apiClient';

/**
 * Tag type based on Pimcore Studio API
 * @see @pimcore/studio-ui-bundle tags-api-slice.gen.d.ts
 */
export interface Tag {
  /** tag ID */
  id: number;
  /** parent tag ID */
  parentId: number;
  /** tag text */
  text: string;
  /** path */
  path: string;
  /** has children */
  hasChildren: boolean;
  /** IconName */
  iconName?: string;
  /** AdditionalAttributes */
  additionalAttributes?: {
    [key: string]: string | number | boolean | object;
  };
  /** Children tags (for hierarchical display) */
  children: Tag[];
}

/**
 * Response for element tags
 * @see TagGetCollectionForElementByTypeAndIdApiResponse
 */
export interface ElementTagsResponse {
  totalItems: number;
  items: Tag[];
}

/**
 * Response for all available tags
 * @see TagGetCollectionApiResponse
 */
export interface AllTagsResponse {
  items?: Tag[];
}

/**
 * Element type as defined in Pimcore API
 * @see TagAssignToElementApiArg.elementType
 */
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
