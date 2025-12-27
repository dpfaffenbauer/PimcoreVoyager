/**
 * RGBAColor Transformer
 * 
 * Transforms RGBA color values between API and UI formats
 */

import { RGBAColorValue, DEFAULT_RGBA_VALUE } from './RGBAColor.types';

export const RGBAColorTransformer = {
  /**
   * Transform from Pimcore API format to UI format
   * API format may be an object with r, g, b, a properties or null
   */
  fromAPI: (apiValue: any): RGBAColorValue | null => {
    if (!apiValue || typeof apiValue !== 'object') {
      return null;
    }

    // Ensure all values are valid numbers
    const r = typeof apiValue.r === 'number' ? Math.round(Math.max(0, Math.min(255, apiValue.r))) : 0;
    const g = typeof apiValue.g === 'number' ? Math.round(Math.max(0, Math.min(255, apiValue.g))) : 0;
    const b = typeof apiValue.b === 'number' ? Math.round(Math.max(0, Math.min(255, apiValue.b))) : 0;
    const a = typeof apiValue.a === 'number' ? Math.max(0, Math.min(1, apiValue.a)) : 1;

    return { r, g, b, a };
  },

  /**
   * Transform from UI format to Pimcore API format
   */
  toAPI: (uiValue: RGBAColorValue | null): any => {
    if (!uiValue) {
      return null;
    }

    return {
      r: Math.round(Math.max(0, Math.min(255, uiValue.r))),
      g: Math.round(Math.max(0, Math.min(255, uiValue.g))),
      b: Math.round(Math.max(0, Math.min(255, uiValue.b))),
      a: Math.max(0, Math.min(1, uiValue.a)),
    };
  },

  /**
   * Convert RGBA value to CSS rgba() string for preview
   */
  toRGBAString: (value: RGBAColorValue | null): string => {
    if (!value) {
      return 'rgba(0, 0, 0, 0)';
    }
    return `rgba(${value.r}, ${value.g}, ${value.b}, ${value.a})`;
  },

  /**
   * Convert RGBA value to hex string (without alpha)
   */
  toHexString: (value: RGBAColorValue | null): string => {
    if (!value) {
      return '#000000';
    }
    const r = value.r.toString(16).padStart(2, '0');
    const g = value.g.toString(16).padStart(2, '0');
    const b = value.b.toString(16).padStart(2, '0');
    return `#${r}${g}${b}`.toUpperCase();
  },
};
