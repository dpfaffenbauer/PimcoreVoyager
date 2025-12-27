/**
 * RGBAColor Validator
 * 
 * Validates RGBA color values
 */

import { ValidationResult } from '../types';
import { RGBAColorValue, RGBAColorConfig } from './RGBAColor.types';

/**
 * Validates a single color channel value
 */
function isValidColorChannel(value: number): boolean {
  return typeof value === 'number' && 
         !isNaN(value) && 
         value >= 0 && 
         value <= 255 && 
         Number.isInteger(value);
}

/**
 * Validates alpha channel value
 */
function isValidAlphaChannel(value: number): boolean {
  return typeof value === 'number' && 
         !isNaN(value) && 
         value >= 0 && 
         value <= 1;
}

/**
 * Validates RGBA color value
 */
export function validateRGBAColor(
  value: RGBAColorValue | null | undefined,
  config: RGBAColorConfig
): ValidationResult {
  const errors: string[] = [];

  // Check if required
  if (config.mandatory && !value) {
    errors.push('Dieses Feld ist erforderlich');
    return { valid: false, errors };
  }

  // If not required and empty, it's valid
  if (!value) {
    return { valid: true, errors: [] };
  }

  // Validate structure
  if (typeof value !== 'object') {
    errors.push('Ungültiges Farbformat');
    return { valid: false, errors };
  }

  // Validate red channel
  if (!isValidColorChannel(value.r)) {
    errors.push('Rotwert muss eine Ganzzahl zwischen 0 und 255 sein');
  }

  // Validate green channel
  if (!isValidColorChannel(value.g)) {
    errors.push('Grünwert muss eine Ganzzahl zwischen 0 und 255 sein');
  }

  // Validate blue channel
  if (!isValidColorChannel(value.b)) {
    errors.push('Blauwert muss eine Ganzzahl zwischen 0 und 255 sein');
  }

  // Validate alpha channel
  if (!isValidAlphaChannel(value.a)) {
    errors.push('Alpha-Wert muss eine Zahl zwischen 0 und 1 sein');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
