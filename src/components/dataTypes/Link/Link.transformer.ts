/**
 * Link Data Type Transformer
 * Handles conversion between Pimcore API format and UI format
 */

import { LinkValue } from './Link.types';

export const LinkTransformer = {
  /**
   * Transform from Pimcore API format to UI format
   */
  fromAPI: (apiValue: any): LinkValue | null => {
    if (apiValue === null || apiValue === undefined) {
      return null;
    }

    // Ensure all required fields have default values
    return {
      text: apiValue.text || '',
      linktype: apiValue.linktype || 'direct',
      direct: apiValue.direct || null,
      internal: apiValue.internal || null,
      internalType: apiValue.internalType || null,
      fullPath: apiValue.fullPath || '',
      target: apiValue.target || null,
      parameters: apiValue.parameters || '',
      anchor: apiValue.anchor || '',
      title: apiValue.title || '',
      accesskey: apiValue.accesskey || '',
      rel: apiValue.rel || '',
      tabindex: apiValue.tabindex || '',
      class: apiValue.class || '',
    };
  },

  /**
   * Transform from UI format to Pimcore API format
   */
  toAPI: (uiValue: LinkValue | null): any => {
    if (uiValue === null || uiValue === undefined) {
      return null;
    }

    // Clean up the value - only include non-empty fields
    const apiValue: any = {
      text: uiValue.text || '',
      linktype: uiValue.linktype,
    };

    // Add type-specific fields
    if (uiValue.linktype === 'direct') {
      apiValue.direct = uiValue.direct || null;
    } else if (uiValue.linktype === 'internal') {
      apiValue.internal = uiValue.internal || null;
      apiValue.internalType = uiValue.internalType || null;
      apiValue.fullPath = uiValue.fullPath || '';
    }

    // Add optional fields only if they have values
    if (uiValue.target) apiValue.target = uiValue.target;
    if (uiValue.parameters) apiValue.parameters = uiValue.parameters;
    if (uiValue.anchor) apiValue.anchor = uiValue.anchor;
    if (uiValue.title) apiValue.title = uiValue.title;
    if (uiValue.accesskey) apiValue.accesskey = uiValue.accesskey;
    if (uiValue.rel) apiValue.rel = uiValue.rel;
    if (uiValue.tabindex) apiValue.tabindex = uiValue.tabindex;
    if (uiValue.class) apiValue.class = uiValue.class;

    return apiValue;
  },
};
