/**
 * Newsletter Active Transformer
 * Transforms data between Pimcore API format and UI format
 */

/**
 * Newsletter Active Transformer
 * Handles conversion between API and UI formats
 */
export const NewsletterActiveTransformer = {
  /**
   * Transform from Pimcore API format to UI format
   * @param apiValue - Value from Pimcore API (can be boolean, number, string, or null)
   * @returns Boolean value for UI (defaults to false)
   */
  fromAPI: (apiValue: any): boolean => {
    // Handle null/undefined
    if (apiValue === null || apiValue === undefined) {
      return false;
    }

    // Handle boolean
    if (typeof apiValue === 'boolean') {
      return apiValue;
    }

    // Handle numeric (1 = true, 0 = false)
    if (typeof apiValue === 'number') {
      return apiValue === 1;
    }

    // Handle string ('true', '1', 'yes', 'active' = true)
    if (typeof apiValue === 'string') {
      const normalized = apiValue.toLowerCase().trim();
      return normalized === 'true' || 
             normalized === '1' || 
             normalized === 'yes' || 
             normalized === 'active';
    }

    // Default to false for any other type
    return false;
  },

  /**
   * Transform from UI format to Pimcore API format
   * @param uiValue - Boolean value from UI
   * @returns Boolean value for API
   */
  toAPI: (uiValue: boolean): boolean => {
    // Ensure we always return a boolean
    return uiValue === true;
  },
};
