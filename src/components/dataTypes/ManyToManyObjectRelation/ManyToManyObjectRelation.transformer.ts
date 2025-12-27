/**
 * Transformer for Many-to-Many Object Relation
 * Converts between Pimcore API format and UI format
 */

import { DataTypeTransformer } from '../types';
import { ManyToManyObjectRelationValue, RelatedObject } from './ManyToManyObjectRelation.types';

export const ManyToManyObjectRelationTransformer: DataTypeTransformer<
  any,
  ManyToManyObjectRelationValue
> = {
  /**
   * Transform from Pimcore API format to UI format
   */
  fromAPI: (apiValue: any): ManyToManyObjectRelationValue => {
    if (!apiValue) {
      return [];
    }

    // Handle array of objects
    if (Array.isArray(apiValue)) {
      return apiValue.map((item: any) => ({
        id: item.id || item.objectId,
        key: item.key || item.name || '',
        path: item.path || '',
        fullPath: item.fullPath || item.fullpath || item.path || '',
        type: item.type || 'object',
        className: item.className || item.classname || item.class,
        published: item.published !== undefined ? item.published : true,
      }));
    }

    // Handle single object (convert to array)
    if (typeof apiValue === 'object') {
      return [
        {
          id: apiValue.id || apiValue.objectId,
          key: apiValue.key || apiValue.name || '',
          path: apiValue.path || '',
          fullPath: apiValue.fullPath || apiValue.fullpath || apiValue.path || '',
          type: apiValue.type || 'object',
          className: apiValue.className || apiValue.classname || apiValue.class,
          published: apiValue.published !== undefined ? apiValue.published : true,
        },
      ];
    }

    return [];
  },

  /**
   * Transform from UI format to Pimcore API format
   */
  toAPI: (uiValue: ManyToManyObjectRelationValue): any => {
    if (!uiValue || !Array.isArray(uiValue)) {
      return [];
    }

    return uiValue.map((item: RelatedObject) => ({
      id: item.id,
      type: item.type,
      className: item.className,
    }));
  },
};
