/**
 * Validator for Many-to-Many Object Relation
 * Validates relation data based on configuration
 */

import { ValidationResult } from '../types';
import { ManyToManyObjectRelationValue, ManyToManyObjectRelationConfig } from './ManyToManyObjectRelation.types';

export function validateManyToManyObjectRelation(
  value: ManyToManyObjectRelationValue,
  config: ManyToManyObjectRelationConfig
): ValidationResult {
  const errors: string[] = [];

  // Required validation
  if (config.mandatory && (!value || value.length === 0)) {
    errors.push('Mindestens eine Relation ist erforderlich');
  }

  // Validate each related object
  if (value && Array.isArray(value)) {
    value.forEach((item, index) => {
      // Check if ID is valid
      if (!item.id || item.id <= 0) {
        errors.push(`Relation ${index + 1}: Ungültige Objekt-ID`);
      }

      // Check if class is allowed (if specified in config)
      if (config.classes && config.classes.length > 0) {
        if (!item.className || !config.classes.includes(item.className)) {
          errors.push(
            `Relation ${index + 1}: Klasse "${item.className}" ist nicht erlaubt. Erlaubte Klassen: ${config.classes.join(', ')}`
          );
        }
      }

      // Check if allowedClassId is set (alternative to classes array)
      if (config.allowedClassId && item.className !== config.allowedClassId) {
        errors.push(
          `Relation ${index + 1}: Nur Objekte der Klasse "${config.allowedClassId}" sind erlaubt`
        );
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
