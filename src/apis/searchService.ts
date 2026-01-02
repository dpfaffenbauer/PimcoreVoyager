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

      console.log('Quick search response:', response.data);

      return {
        items: response.data.items || [],
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      console.error('Error in quick search:', error);
      return { items: [], totalItems: 0 };
    }
  }

  /**
   * Search data objects
   * POST /pimcore-studio/api/search/data-objects
   */
  static async searchDataObjects(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20,
    classId?: string
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

      // Add class filter if specified
      if (classId) {
        filters.classId = classId;
      }

      const response = await apiClient.post('/search/data-objects', {
        columns: DATA_OBJECT_COLUMNS,
        filters,
      });

      console.log('Data objects search response:', response.data);

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
      console.error('Error searching data objects:', error);
      return { items: [], totalItems: 0 };
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

      const filters: any = {
        includeDescendants: true,
        page,
        pageSize,
        columnFilters: [
          { type: 'system.fulltext', filterValue: searchTerm, locale: null },
        ],
      };

      // Add type filter if specified
      if (assetType) {
        filters.type = assetType;
      }

      const response = await apiClient.post('/search/assets', {
        folderId: 1,
        columns: ASSET_COLUMNS,
        filters,
      });

      console.log('Assets search response:', response.data);

      // Transform response - columns are in a nested array
      const items = (response.data.items || []).map((item: any) => {
        const columnData = extractColumnsToObject(item.columns, ASSET_COLUMNS);
        return {
          id: item.id,
          type: columnData.type || 'asset',
          fullpath: columnData.fullpath,
          filename: columnData.filename,
          preview: columnData.preview,
        };
      });

      return {
        items,
        totalItems: response.data.totalItems || 0,
      };
    } catch (error) {
      console.error('Error searching assets:', error);
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

      console.log('Documents search response:', response.data);

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
      console.error('Error searching documents:', error);
      return { items: [], totalItems: 0 };
    }
  }
}
