/**
 * Properties Service
 * Handles fetching element properties
 */

import { getApiClient } from './apiClient';

export type PropertyType = 'text' | 'document' | 'asset' | 'object' | 'bool' | 'select';
export type ElementType = 'data-object' | 'asset' | 'document';

export interface ElementProperty {
  key: string;
  type: PropertyType;
  data: string | boolean | null | {
    path: string;
    id: number;
    type: string;
    key: string;
    fullPath: string;
  };
  inheritable: boolean;
  inherited: boolean;
  config?: string | null;
  predefinedName?: string;
  description?: string | null;
}

export interface PropertiesResponse {
  items: Record<string, ElementProperty>;
}

export class PropertiesService {
  /**
   * Get properties for a specific element
   * Endpoint: GET /pimcore-studio/api/properties/{elementType}/{id}
   */
  static async getElementProperties(elementType: ElementType, elementId: number): Promise<ElementProperty[]> {
    try {
      const apiClient = getApiClient();
      const path = `/properties/${elementType}/${elementId}`;
      const response = await apiClient.get<PropertiesResponse>(path);

      // API returns items as object with keys, convert to array
      const items = response.data.items || {};
      return Object.values(items);
    } catch (error) {
      console.error('Error fetching element properties:', error);
      return [];
    }
  }
}
