/**
 * Newsletter Active Validator
 * Validation logic for Newsletter Active field
 */

import type { NewsletterActiveConfig, ValidationResult } from './NewsletterActive.types';

/**
 * Validates Newsletter Active field value
 * @param value - The current value (boolean)
 * @param config - Field configuration
 * @returns Validation result with errors if any
 */
export function validateNewsletterActive(
  value: boolean | null | undefined,
  config: NewsletterActiveConfig
): ValidationResult {
  const errors: string[] = [];

  // Check if field is mandatory and value is not set
  // For boolean fields, we consider null/undefined as unset
  if (config.mandatory && (value === null || value === undefined)) {
    errors.push('This field is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
