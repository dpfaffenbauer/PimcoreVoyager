/**
 * Localizedfields transformer
 * Handles conversion between Pimcore API format and UI format
 */

import { LocalizedValue } from './Localizedfields.types';

export const LocalizedfieldsTransformer = {
  /**
   * Transform from Pimcore API format to UI format
   * API format: { [languageCode]: { [fieldName]: value } }
   * UI format: same structure
   */
  fromAPI: (apiValue: any): LocalizedValue => {
    if (!apiValue || typeof apiValue !== 'object') {
      return {};
    }
    
    // Pimcore returns localizedfields as an object with language codes as keys
    // Each language contains an object with field names as keys
    return apiValue as LocalizedValue;
  },

  /**
   * Transform from UI format to Pimcore API format
   * UI format: { [languageCode]: { [fieldName]: value } }
   * API format: same structure
   */
  toAPI: (uiValue: LocalizedValue): any => {
    if (!uiValue || typeof uiValue !== 'object') {
      return null;
    }
    
    // Remove empty language objects
    const cleanedValue: LocalizedValue = {};
    Object.keys(uiValue).forEach(langCode => {
      const langData = uiValue[langCode];
      if (langData && Object.keys(langData).length > 0) {
        cleanedValue[langCode] = langData;
      }
    });
    
    return Object.keys(cleanedValue).length > 0 ? cleanedValue : null;
  },
};
