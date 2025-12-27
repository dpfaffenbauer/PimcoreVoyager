/**
 * Textarea Data Type - Transformer
 * Transforms data between Pimcore API format and UI format
 */

/**
 * Transform from Pimcore API format to UI format
 * @param apiValue - Value from Pimcore API
 * @returns UI-ready string value
 */
export const fromAPI = (apiValue: string | null | undefined): string => {
  if (apiValue === null || apiValue === undefined) {
    return '';
  }
  return String(apiValue);
};

/**
 * Transform from UI format to Pimcore API format
 * @param uiValue - Value from UI
 * @returns API-ready value (string or null)
 */
export const toAPI = (uiValue: string): string | null => {
  if (uiValue === '' || uiValue === null || uiValue === undefined) {
    return null;
  }
  return uiValue;
};

export const TextareaTransformer = {
  fromAPI,
  toAPI,
};
