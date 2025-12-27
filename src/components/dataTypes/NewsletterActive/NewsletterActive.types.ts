/**
 * Newsletter Active Data Type
 * Type definitions for Newsletter Active field
 */

import type { ValidationResult } from '../types';

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

// Re-export for internal use
export type { ValidationResult };
