/**
 * Transformer for Many-to-One Relation
 * Converts between Pimcore API format and UI format
 */

import { DataTypeTransformer } from '../types';
import { ManyToOneRelationValue } from './ManyToOneRelation.types';

/**
 * Many-to-One Relation Transformer
 * Handles conversion between API and UI formats
 */
export const ManyToOneRelationTransformer: DataTypeTransformer<any, ManyToOneRelationValue | null> = {
  /**
   * Transform from Pimcore API format to UI format
   * API format can be:
   * - null/undefined
   * - { id, type, className, ... } object
   * - Array with single object (some Pimcore versions)
   */
  fromAPI: (apiValue: any): ManyToOneRelationValue | null => {
    if (!apiValue) {
      return null;
    }

    // Handle array format (some Pimcore versions return array)
    if (Array.isArray(apiValue)) {
      if (apiValue.length === 0) {
        return null;
      }
      apiValue = apiValue[0];
    }

    // Handle object format
    if (typeof apiValue === 'object' && apiValue.id) {
      return {
        id: Number(apiValue.id),
        type: apiValue.type || 'object',
        className: apiValue.className || apiValue.class || apiValue.classname,
        key: apiValue.key || apiValue.filename,
        path: apiValue.path || apiValue.fullpath,
        published: apiValue.published !== undefined ? Boolean(apiValue.published) : undefined,
      };
    }

    // Handle ID-only format (legacy)
    if (typeof apiValue === 'number' || typeof apiValue === 'string') {
      return {
        id: Number(apiValue),
        type: 'object',
      };
    }

    return null;
  },

  /**
   * Transform from UI format to Pimcore API format
   * API expects: { id, type } or just id number
   */
  toAPI: (uiValue: ManyToOneRelationValue | null): any => {
    if (!uiValue) {
      return null;
    }

    // Return object with id and type
    // This is the most common format for Pimcore Studio API
    return {
      id: uiValue.id,
      type: uiValue.type,
    };
  },
};
