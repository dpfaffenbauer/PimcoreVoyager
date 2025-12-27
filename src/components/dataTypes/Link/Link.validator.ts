/**
 * Link Data Type Validator
 */

import { LinkValue, LinkConfig } from './Link.types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate a Link value based on configuration
 */
export function validateLink(
  value: LinkValue | null,
  config: LinkConfig
): ValidationResult {
  const errors: string[] = [];

  // Required validation
  if (config.required) {
    if (!value) {
      errors.push('This field is required');
      return { valid: false, errors };
    }

    // Check that at least one link is set
    if (value.linktype === 'direct' && (!value.direct || value.direct.trim() === '')) {
      errors.push('Direct URL is required');
    }

    if (value.linktype === 'internal' && !value.internal) {
      errors.push('Internal object selection is required');
    }
  }

  // Validate direct URL format
  if (value && value.linktype === 'direct' && value.direct) {
    const urlPattern = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
    const absolutePattern = /^https?:\/\//;
    
    // Check if it's a relative URL or absolute URL
    if (!value.direct.startsWith('/') && !absolutePattern.test(value.direct)) {
      // If not relative and not starting with http(s), it might be invalid
      if (!urlPattern.test(value.direct)) {
        errors.push('Please enter a valid URL');
      }
    }
  }

  // Validate allowed types
  if (
    value &&
    config.allowedTypes &&
    config.allowedTypes.length > 0 &&
    !config.allowedTypes.includes(value.linktype)
  ) {
    errors.push(`Link type "${value.linktype}" is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
