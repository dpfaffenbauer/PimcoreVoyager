/**
 * Multiselect Validator
 * Validates multiselect field values
 */

import { ValidationResult } from '../types';
import { MultiselectConfig } from './Multiselect.types';

export function validateMultiselect(
  value: (string | number)[] | null | undefined,
  config: MultiselectConfig
): ValidationResult {
  const errors: string[] = [];

  // Required validation
  if (config.mandatory && (!value || value.length === 0)) {
    errors.push('Dieses Feld ist erforderlich');
  }

  // Max items validation
  if (value && config.maxItems && value.length > config.maxItems) {
    errors.push(`Maximal ${config.maxItems} Elemente erlaubt`);
  }

  // Validate that selected values exist in options
  if (value && config.options && value.length > 0) {
    const validValues = config.options.map(opt => opt.value);
    const invalidValues = value.filter(v => !validValues.includes(v));
    
    if (invalidValues.length > 0) {
      errors.push('Ungültige Auswahl erkannt');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
