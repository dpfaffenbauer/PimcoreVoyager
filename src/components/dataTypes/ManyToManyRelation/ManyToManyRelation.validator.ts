/**
 * Validator for Many-to-Many Relation data type
 */

import {
  ManyToManyRelationValue,
  ManyToManyRelationConfig,
  ValidationResult,
} from './ManyToManyRelation.types';

export function validateManyToManyRelation(
  value: ManyToManyRelationValue,
  config: ManyToManyRelationConfig
): ValidationResult {
  const errors: string[] = [];

  // Required validation
  if (config.mandatory) {
    if (!value || value.length === 0) {
      errors.push('Dieses Feld ist erforderlich');
    }
  }

  // Max items validation
  if (value && config.maxItems && value.length > config.maxItems) {
    errors.push(`Maximal ${config.maxItems} ${config.maxItems === 1 ? 'Element' : 'Elemente'} erlaubt`);
  }

  // Type validation
  if (value && config.types && config.types.length > 0) {
    const invalidItems = value.filter(
      (item) => !config.types!.includes(item.type)
    );
    if (invalidItems.length > 0) {
      const allowedTypes = config.types.join(', ');
      errors.push(`Nur folgende Typen erlaubt: ${allowedTypes}`);
    }
  }

  // Class validation (for object types)
  if (value && config.classes && config.classes.length > 0) {
    const objectItems = value.filter((item) => item.type === 'object');
    const invalidItems = objectItems.filter(
      (item) => !item.className || !config.classes!.includes(item.className)
    );
    if (invalidItems.length > 0) {
      const allowedClasses = config.classes.join(', ');
      errors.push(`Nur folgende Klassen erlaubt: ${allowedClasses}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate if a new item can be added to the relation
 */
export function canAddItem(
  currentValue: ManyToManyRelationValue,
  config: ManyToManyRelationConfig
): { canAdd: boolean; reason?: string } {
  // Check max items
  if (config.maxItems) {
    const currentCount = currentValue ? currentValue.length : 0;
    if (currentCount >= config.maxItems) {
      return {
        canAdd: false,
        reason: `Maximale Anzahl von ${config.maxItems} ${config.maxItems === 1 ? 'Element' : 'Elementen'} erreicht`,
      };
    }
  }

  // Check if readonly
  if (config.noteditable) {
    return {
      canAdd: false,
      reason: 'Dieses Feld ist schreibgeschützt',
    };
  }

  return { canAdd: true };
}

/**
 * Check if an item is already in the relation
 */
export function isItemInRelation(
  item: { id: number; type: string },
  currentValue: ManyToManyRelationValue
): boolean {
  if (!currentValue) return false;
  
  return currentValue.some(
    (existingItem) =>
      existingItem.id === item.id && existingItem.type === item.type
  );
}
