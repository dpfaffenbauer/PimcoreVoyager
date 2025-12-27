/**
 * Multiselect Transformer
 * Transforms data between Pimcore API format and UI format
 */

import { DataTypeTransformer } from '../types';

export const MultiselectTransformer: DataTypeTransformer<
  (string | number)[] | null,
  (string | number)[]
> = {
  /**
   * Transform from Pimcore API format to UI format
   */
  fromAPI: (apiValue: (string | number)[] | null): (string | number)[] => {
    if (apiValue === null || apiValue === undefined) {
      return [];
    }
    
    // Ensure we always return an array
    if (!Array.isArray(apiValue)) {
      return [];
    }
    
    return apiValue;
  },

  /**
   * Transform from UI format to Pimcore API format
   */
  toAPI: (uiValue: (string | number)[]): (string | number)[] | null => {
    if (!uiValue || uiValue.length === 0) {
      return null;
    }
    
    // Return the array as-is for the API
    return uiValue;
  },
};
