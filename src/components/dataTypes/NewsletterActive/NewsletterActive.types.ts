/**
 * Newsletter Active Data Type
 * Type definitions for Newsletter Active field
 */

export interface NewsletterActiveValue {
  value: boolean;
}

export interface NewsletterActiveConfig {
  label: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  defaultValue?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
