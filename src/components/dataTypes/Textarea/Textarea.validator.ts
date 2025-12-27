/**
 * Textarea Data Type - Validator
 * Validation logic for Pimcore Textarea field
 */

import { TextareaConfig } from './Textarea.types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validate textarea value based on configuration
 * @param value - The textarea value to validate
 * @param config - Textarea field configuration
 * @returns Validation result with errors if any
 */
export function validateTextarea(
  value: string,
  config: TextareaConfig
): ValidationResult {
  const errors: string[] = [];

  // Required validation
  if (config.required && (!value || value.trim() === '')) {
    errors.push('This field is required');
  }

  // Skip length validation if value is empty and not required
  if (value && value.trim() !== '') {
    // Min length validation
    if (config.minLength && value.length < config.minLength) {
      errors.push(`At least ${config.minLength} characters required`);
    }

    // Max length validation
    if (config.maxLength && value.length > config.maxLength) {
      errors.push(`Maximum ${config.maxLength} characters allowed`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
