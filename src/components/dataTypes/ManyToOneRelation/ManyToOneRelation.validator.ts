/**
 * Validator for Many-to-One Relation
 */

import { ValidationResult } from '../types';
import { ManyToOneRelationValue, ManyToOneRelationConfig } from './ManyToOneRelation.types';

export function validateManyToOneRelation(
  value: ManyToOneRelationValue | null,
  config: ManyToOneRelationConfig
): ValidationResult {
  const errors: string[] = [];

  // Required validation
  if (config.mandatory && !value) {
    errors.push('This field is required');
  }

  // If value exists, validate its structure
  if (value) {
    if (!value.id || typeof value.id !== 'number') {
      errors.push('Invalid relation: missing or invalid ID');
    }

    if (!value.type) {
      errors.push('Invalid relation: missing type');
    }

    // Validate against allowed classes if configured
    if (config.classes && config.classes.length > 0 && value.className) {
      if (!config.classes.includes(value.className)) {
        errors.push(
          `Invalid class: ${value.className}. Allowed classes: ${config.classes.join(', ')}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
