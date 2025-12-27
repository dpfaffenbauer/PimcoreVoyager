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
    errors.push('Dieses Feld ist erforderlich');
  }

  // Skip length validation if value is empty and not required
  if (value && value.trim() !== '') {
    // Min length validation
    if (config.minLength && value.length < config.minLength) {
      errors.push(`Mindestens ${config.minLength} Zeichen erforderlich`);
    }

    // Max length validation
    if (config.maxLength && value.length > config.maxLength) {
      errors.push(`Maximal ${config.maxLength} Zeichen erlaubt`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
