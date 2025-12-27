/**
 * Transformer for Many-to-Many Relation data type
 * Converts between Pimcore API format and UI format
 */

import { ManyToManyRelationValue, ManyToManyRelationItem } from './ManyToManyRelation.types';

export const ManyToManyRelationTransformer = {
  /**
   * Transform from Pimcore API format to UI format
   * API format can be an array of relation objects or null
   */
  fromAPI: (apiValue: any): ManyToManyRelationValue => {
    if (!apiValue || !Array.isArray(apiValue)) {
      return null;
    }

    return apiValue.map((item: any): ManyToManyRelationItem => {
      return {
        id: item.id || item.elementId || 0,
        type: item.type || item.elementType || 'object',
        subtype: item.subtype || item.elementSubtype,
        path: item.path || item.fullPath || '',
        key: item.key || item.filename || '',
        className: item.className || item.classname,
        published: item.published !== undefined ? item.published : true,
      };
    });
  },

  /**
   * Transform from UI format to Pimcore API format
   * API expects array of objects with id and type
   */
  toAPI: (uiValue: ManyToManyRelationValue): any => {
    if (!uiValue || uiValue.length === 0) {
      return null;
    }

    return uiValue.map((item) => ({
      id: item.id,
      type: item.type,
    }));
  },

  /**
   * Check if the value is empty
   */
  isEmpty: (value: ManyToManyRelationValue): boolean => {
    return !value || value.length === 0;
  },

  /**
   * Get display text for a relation item
   */
  getDisplayText: (item: ManyToManyRelationItem): string => {
    const parts = [];
    
    if (item.key) {
      parts.push(item.key);
    }
    
    if (item.className) {
      parts.push(`(${item.className})`);
    } else if (item.type) {
      parts.push(`(${item.type})`);
    }
    
    return parts.join(' ') || `ID: ${item.id}`;
  },
};
