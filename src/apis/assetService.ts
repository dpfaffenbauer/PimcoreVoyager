/**
 * Asset Service
 * Handles all asset related API calls
 *
 * Uses types from @pimcore/studio-ui-bundle for API consistency
 */

import { getApiClient } from './apiClient';
import type {
  Asset,
  AssetFolder,
  AssetGetByIdApiResponse,
  AssetGetTreeApiResponse,
  AssetGetTreeApiArg,
} from '../types/pimcore';

// Response type for tree operations
export interface AssetTreeResponse {
  items: (Asset | AssetFolder)[];
  totalItems: number;
}

export class AssetService {
  /**
   * Get asset tree structure starting from root or specific parent
   * Endpoint: GET /pimcore-studio/api/assets/tree
   */
  static async getAssetTreeLevel(parentId: number = 1): Promise<(Asset | AssetFolder)[]> {
    try {
      const apiClient = getApiClient();
      const params: Partial<AssetGetTreeApiArg> = {
        parentId,
        page: 1,
        pageSize: 100,
      };

      const response = await apiClient.get<AssetGetTreeApiResponse>('/assets/tree', { params });
      console.log('Asset tree response:', response.data);
      return response.data.items || [];
    } catch (error) {
      console.error('Error fetching asset tree level:', error);
      return [];
    }
  }

  /**
   * Get a single asset by ID
   * Endpoint: GET /pimcore-studio/api/assets/{id}
   */
  static async getAsset(id: number): Promise<AssetGetByIdApiResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get<AssetGetByIdApiResponse>(`/assets/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching asset:', error);
      throw error;
    }
  }

  /**
   * Get assets in a folder (excluding sub-folders)
   * Endpoint: GET /pimcore-studio/api/assets/tree
   * Uses path filter to get all assets within a folder including descendants
   */
  static async getFolderAssets(
    folderPath: string,
    page: number = 1,
    pageSize: number = 20,
    excludeFolders: boolean = true
  ): Promise<AssetTreeResponse> {
    try {
      const apiClient = getApiClient();
      const params: Partial<AssetGetTreeApiArg> & { path?: string; pathIncludeDescendants?: boolean } = {
        page,
        pageSize,
        path: folderPath,
        pathIncludeDescendants: true,
      };

      if (excludeFolders) {
        params.excludeFolders = true;
      }

      const response = await apiClient.get<AssetGetTreeApiResponse>('/assets/tree', { params });
      console.log('Folder assets response:', response.data);

      return {
        items: response.data.items || [],
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      console.error('Error fetching folder assets:', error);
      return { items: [], totalItems: 0 };
    }
  }
}
