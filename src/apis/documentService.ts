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

  /**
   * Update a link document's settings
   * Endpoint: PUT /pimcore-studio/api/documents/{id}
   */
  static async updateLinkDocument(
    id: number,
    linkData: {
      linkType: 'internal' | 'direct';
      internal?: number | null;
      internalType?: string | null;
      direct?: string | null;
      rawHref?: string | null;
    },
    task: 'save' | 'publish' = 'publish'
  ): Promise<any> {
    try {
      const apiClient = getApiClient();

      // Build settingsData - all fields must be present
      // internal must be the document ID as a number
      const internalId = linkData.linkType === 'internal' && linkData.internal
        ? Number(linkData.internal)
        : null;

      const settingsData = {
        internal: internalId,
        internalType: linkData.linkType === 'internal' ? (linkData.internalType || 'document') : null,
        direct: linkData.linkType === 'direct' ? (linkData.direct || '') : '',
        linkType: linkData.linkType,
        href: '',
        rawHref: linkData.rawHref || '',
        path: linkData.rawHref || '',
      };

      const requestBody = {
        data: {
          settingsData: settingsData,
          task: task,
          useDraftData: true,
        },
      };

      const response = await apiClient.put(`/documents/${id}`, requestBody);
      return response.data;
    } catch (error) {
      console.error('Error updating link document:', error);
      throw error;
    }
  }

  /**
   * Update a hardlink document's settings
   * Endpoint: PUT /pimcore-studio/api/documents/{id}
   */
  static async updateHardlinkDocument(
    id: number,
    hardlinkData: {
      sourceId?: number | null;
      sourcePath?: string | null;
      propertiesFromSource: boolean;
      childrenFromSource: boolean;
    },
    task: 'save' | 'publish' = 'publish'
  ): Promise<any> {
    try {
      const apiClient = getApiClient();

      const settingsData = {
        sourceId: hardlinkData.sourceId ?? null,
        sourcePath: hardlinkData.sourcePath ?? null,
        propertiesFromSource: hardlinkData.propertiesFromSource,
        childrenFromSource: hardlinkData.childrenFromSource,
      };

      const requestBody = {
        data: {
          settingsData: settingsData,
          task: task,
          useDraftData: true,
        },
      };

      const response = await apiClient.put(`/documents/${id}`, requestBody);
      return response.data;
    } catch (error) {
      console.error('Error updating hardlink document:', error);
      throw error;
    }
  }
}
