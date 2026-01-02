/**
 * Dependencies Service
 * Handles fetching dependencies for elements
 */

import { getApiClient } from './apiClient';

export type DependencyElementType = 'data-object' | 'asset' | 'document';
export type DependencyMode = 'requires' | 'required_by';

export interface Dependency {
  id: number;
  path: string;
  type: 'dataObject' | 'asset' | 'document';
  subType: string;
  published: boolean;
  additionalAttributes: any[];
}

export interface DependenciesResponse {
  totalItems: number;
  items: Dependency[];
}

export class DependenciesService {
  /**
   * Get dependencies for a specific element
   * Endpoint: GET /pimcore-studio/api/dependencies/{elementType}/{id}
   */
  static async getDependencies(
    elementType: DependencyElementType,
    elementId: number,
    mode: DependencyMode,
    page: number = 1,
    pageSize: number = 20
  ): Promise<DependenciesResponse> {
    try {
      const apiClient = getApiClient();
      const path = `/dependencies/${elementType}/${elementId}`;
      const response = await apiClient.get<DependenciesResponse>(path, {
        params: { page, pageSize, dependencyMode: mode },
      });

      return {
        totalItems: response.data.totalItems || 0,
        items: response.data.items || [],
      };
    } catch (error) {
      console.error('Error fetching dependencies:', error);
      return { totalItems: 0, items: [] };
    }
  }
}
