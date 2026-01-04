/**
 * Search Service
 * Handles search functionality across Pimcore data types
 * Based on Pimcore Studio API search endpoints
 */

import { getApiClient } from './apiClient';

export interface SearchResult {
  id: number;
  type: string;
  fullpath: string;
  key?: string;
  filename?: string;
  classname?: string;
  published?: boolean;
  title?: string;
  description?: string;
  preview?: string;
}

export interface SearchResponse {
  items: SearchResult[];
  totalItems: number;
}

export interface QuickSearchResult {
  id: number;
  type: string;
  elementType?: string;
  path: string;
  icon?: any;
}

export interface QuickSearchResponse {
  items: QuickSearchResult[];
  totalItems: number;
}

// Column definitions for different search types
const DATA_OBJECT_COLUMNS = [
  { key: 'type', type: 'system.string', locale: null, config: [] },
  { key: 'fullpath', type: 'system.string', locale: null, config: [] },
  { key: 'classname', type: 'system.string', locale: null, config: [] },
  { key: 'id', type: 'system.id', locale: null, config: [] },
  { key: 'key', type: 'system.string', locale: null, config: [] },
  { key: 'published', type: 'system.boolean', locale: null, config: [] },
];

const ASSET_COLUMNS = [
  { key: 'preview', type: 'system.preview', group: ['system'], locale: null, config: [] },
  { key: 'type', type: 'system.string', group: ['system'], locale: null, config: [] },
  { key: 'fullpath', type: 'system.string', group: ['system'], locale: null, config: [] },
  { key: 'id', type: 'system.id', group: ['system'], locale: null, config: [] },
  { key: 'filename', type: 'system.string', group: ['system'], locale: null, config: [] },
];

const DOCUMENT_COLUMNS = [
  { key: 'type', type: 'system.string', group: ['system'], locale: null, config: [] },
  { key: 'fullpath', type: 'system.string', group: ['system'], locale: null, config: [] },
  { key: 'title', type: 'system.string', group: ['system'], locale: null, config: [] },
  { key: 'id', type: 'system.id', group: ['system'], locale: null, config: [] },
  { key: 'filename', type: 'system.string', group: ['system'], locale: null, config: [] },
  { key: 'description', type: 'system.string', group: ['system'], locale: null, config: [] },
  { key: 'published', type: 'system.boolean', group: ['system'], locale: null, config: [] },
];

/**
 * Helper to extract value from Pimcore API response format
 * API returns values as {value: x} objects
 */
function extractValue(field: any): any {
  if (field === null || field === undefined) return undefined;
  if (typeof field === 'object' && 'value' in field) return field.value;
  return field;
}

/**
 * Helper to convert columns array to object
 * Columns are returned as array in same order as requested
 */
function extractColumnsToObject(columns: any[], columnDefs: any[]): Record<string, any> {
  const result: Record<string, any> = {};
  if (!columns || !Array.isArray(columns)) return result;

  columns.forEach((col, index) => {
    if (columnDefs[index]) {
      result[columnDefs[index].key] = extractValue(col);
    }
  });

  return result;
}

export class SearchService {
  /**
   * Quick search across all types
   * GET /pimcore-studio/api/search
   */
  static async quickSearch(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<QuickSearchResponse> {
    try {
      const apiClient = getApiClient();
      const response = await apiClient.get('/search', {
        params: {
          searchTerm,
          page,
          pageSize,
        },
      });

      return {
        items: response.data.items || [],
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      return { items: [], totalItems: 0 };
    }
  }

  /**
   * Search data objects
   * POST /pimcore-studio/api/search/data-objects?classId=XX
   */
  static async searchDataObjects(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    classId?: string
  ): Promise<SearchResponse> {
    try {
      const apiClient = getApiClient();

      const columnFilters: any[] = [];

      // Add fulltext search filter
      if (searchTerm && searchTerm.trim() && searchTerm !== '*') {
        columnFilters.push({ type: 'system.fulltext', filterValue: searchTerm, locale: null });
      }

      // Add type filter to only get objects (not folders)
      columnFilters.push({ key: 'type', filterValue: 'object', type: 'system.string' });

      const filters: any = {
        includeDescendants: true,
        page,
        pageSize,
        columnFilters,
      };

      // classId is passed as query parameter, not in body
      const url = classId ? `/search/data-objects?classId=${encodeURIComponent(classId)}` : '/search/data-objects';

      const response = await apiClient.post(url, {
        columns: DATA_OBJECT_COLUMNS,
        filters,
      });

      // Transform response - columns are in a nested array
      const items = (response.data.items || []).map((item: any) => {
        const columnData = extractColumnsToObject(item.columns, DATA_OBJECT_COLUMNS);
        return {
          id: item.id,
          type: columnData.type || 'object',
          fullpath: columnData.fullpath,
          key: columnData.key,
          classname: columnData.classname,
          published: columnData.published,
        };
      });

      return {
        items,
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      // Re-throw error so caller can handle it (e.g., retry without class filter)
      throw error;
    }
  }

  /**
   * Search assets
   * POST /pimcore-studio/api/search/assets
   */
  static async searchAssets(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    assetType?: string
  ): Promise<SearchResponse> {
    try {
      const apiClient = getApiClient();

      const columnFilters: any[] = [];

      // Add fulltext search if provided
      if (searchTerm && searchTerm.trim()) {
        columnFilters.push({ type: 'system.fulltext', filterValue: searchTerm, locale: null });
      }

      // Add type filter if specified
      if (assetType) {
        columnFilters.push({ key: 'type', filterValue: assetType, type: 'system.string' });
      }

      const filters: any = {
        includeDescendants: true,
        page,
        pageSize,
        columnFilters,
      };

      const response = await apiClient.post('/search/assets', {
        folderId: 1,
        columns: ASSET_COLUMNS,
        filters,
      });

      // Transform response - columns are returned with key/value structure
      const items = (response.data.items || []).map((item: any) => {
        // Extract column values by key
        const columnMap: Record<string, any> = {};
        if (item.columns && Array.isArray(item.columns)) {
          item.columns.forEach((col: any) => {
            columnMap[col.key] = col.value;
          });
        }

        return {
          id: item.id,
          type: columnMap.type || 'asset',
          fullpath: columnMap.fullpath,
          filename: columnMap.filename,
          preview: columnMap.preview, // Contains { thumbnail, icon }
        };
      });

      return {
        items,
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      return { items: [], totalItems: 0 };
    }
  }

  /**
   * Browse assets in folder (for picker)
   * POST /pimcore-studio/api/search/assets
   */
  static async browseAssets(
    folderId: number = 1,
    page: number = 1,
    pageSize: number = 20,
    assetTypes?: string[]
  ): Promise<{ items: any[]; totalItems: number }> {
    try {
      const apiClient = getApiClient();

      const columnFilters: any[] = [];

      // Add type filter if specified (for filtering to images/videos)
      if (assetTypes && assetTypes.length > 0) {
        // For single type, use simple filter
        if (assetTypes.length === 1) {
          columnFilters.push({ key: 'type', filterValue: assetTypes[0], type: 'system.string' });
        }
        // For multiple types, we need to filter client-side or use OR logic
      }

      const filters: any = {
        includeDescendants: true,
        page,
        pageSize,
        columnFilters,
      };

      const response = await apiClient.post('/search/assets', {
        folderId,
        columns: ASSET_COLUMNS,
        filters,
      });

      // Transform response
      const items = (response.data.items || []).map((item: any) => {
        const columnMap: Record<string, any> = {};
        if (item.columns && Array.isArray(item.columns)) {
          item.columns.forEach((col: any) => {
            columnMap[col.key] = col.value;
          });
        }

        return {
          id: item.id,
          type: columnMap.type || 'asset',
          fullpath: columnMap.fullpath,
          filename: columnMap.filename,
          preview: columnMap.preview,
        };
      });

      // Client-side filter for multiple types
      let filteredItems = items;
      if (assetTypes && assetTypes.length > 1) {
        filteredItems = items.filter((item: any) =>
          item.type === 'folder' || assetTypes.includes(item.type)
        );
      }

      return {
        items: filteredItems,
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      return { items: [], totalItems: 0 };
    }
  }

  /**
   * Browse data objects (for picker)
   * POST /pimcore-studio/api/search/data-objects
   */
  static async browseDataObjects(
    folderId: number = 1,
    page: number = 1,
    pageSize: number = 20,
    classIds?: string[]
  ): Promise<{ items: any[]; totalItems: number }> {
    try {
      const apiClient = getApiClient();

      const columnFilters: any[] = [];

      // Note: class filtering might need to be done differently
      // For now we'll filter client-side if needed

      const filters: any = {
        includeDescendants: true,
        page,
        pageSize,
        columnFilters,
      };

      const response = await apiClient.post('/search/data-objects', {
        folderId,
        columns: DATA_OBJECT_COLUMNS,
        filters,
      });

      // Transform response
      const items = (response.data.items || []).map((item: any) => {
        const columnMap: Record<string, any> = {};
        if (item.columns && Array.isArray(item.columns)) {
          item.columns.forEach((col: any) => {
            columnMap[col.key] = col.value;
          });
        }

        return {
          id: item.id,
          type: columnMap.type || 'object',
          fullpath: columnMap.fullpath,
          key: columnMap.key,
          classname: columnMap.classname,
          published: columnMap.published,
        };
      });

      // Client-side filter by class if specified
      let filteredItems = items;
      if (classIds && classIds.length > 0) {
        filteredItems = items.filter((item: any) =>
          item.type === 'folder' || classIds.includes(item.classname)
        );
      }

      return {
        items: filteredItems,
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      return { items: [], totalItems: 0 };
    }
  }

  /**
   * Search documents
   * POST /pimcore-studio/api/search/documents
   */
  static async searchDocuments(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    docType?: string
  ): Promise<SearchResponse> {
    try {
      const apiClient = getApiClient();

      const filters: any = {
        includeDescendants: true,
        page,
        pageSize,
        columnFilters: [
          { type: 'system.fulltext', filterValue: searchTerm, locale: null },
        ],
      };

      // Add type filter if specified
      if (docType) {
        filters.type = docType;
      }

      const response = await apiClient.post('/search/documents', {
        folderId: 1,
        columns: DOCUMENT_COLUMNS,
        filters,
      });

      // Transform response - columns are in a nested array
      const items = (response.data.items || []).map((item: any) => {
        const columnData = extractColumnsToObject(item.columns, DOCUMENT_COLUMNS);
        return {
          id: item.id,
          type: columnData.type || 'document',
          fullpath: columnData.fullpath,
          filename: columnData.filename,
          title: columnData.title,
          description: columnData.description,
          published: columnData.published,
        };
      });

      return {
        items,
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      return { items: [], totalItems: 0 };
    }
  }
}
