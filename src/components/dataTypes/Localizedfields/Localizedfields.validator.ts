/**
 * Localizedfields validator
 * Validates localized field values
 */

import { ValidationResult } from '../common/types';
import { LocalizedValue, LocalizedfieldsConfig } from './Localizedfields.types';

export function validateLocalizedfields(
  value: LocalizedValue,
  config: LocalizedfieldsConfig
): ValidationResult {
  const errors: string[] = [];

  // Check if mandatory and no values provided
  if (config.mandatory) {
    if (!value || Object.keys(value).length === 0) {
      errors.push('Mindestens eine Sprache muss ausgefüllt werden');
      return { valid: false, errors };
    }

    // Check if at least one language has values
    let hasAnyValue = false;
    Object.keys(value).forEach(langCode => {
      const langData = value[langCode];
      if (langData && Object.keys(langData).length > 0) {
        // Check if any field has a non-empty value
        Object.values(langData).forEach(fieldValue => {
          if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
            hasAnyValue = true;
          }
        });
      }
    });

    if (!hasAnyValue) {
      errors.push('Mindestens ein Feld muss ausgefüllt werden');
    }
  }

  // Validate individual fields if fieldDefinitions are provided
  if (config.fieldDefinitions || config.children || config.referencedFields) {
    const fieldDefs = config.fieldDefinitions || config.children || config.referencedFields || [];
    
    fieldDefs.forEach(fieldDef => {
      if (fieldDef.mandatory && value) {
        // Check if mandatory field is filled in at least one language
        let fieldHasValue = false;
        Object.keys(value).forEach(langCode => {
          const langData = value[langCode];
          if (langData && langData[fieldDef.name]) {
            const fieldValue = langData[fieldDef.name];
            if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
              fieldHasValue = true;
            }
          }
        });

        if (!fieldHasValue) {
          errors.push(`Pflichtfeld "${fieldDef.title || fieldDef.name}" muss in mindestens einer Sprache ausgefüllt werden`);
        }
      }
    });
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
