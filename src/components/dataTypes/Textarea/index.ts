/**
 * Textarea Data Type - Exports
 * Central export point for all Textarea components and utilities
 */

export { TextareaDisplay } from './TextareaDisplay';
export type { TextareaDisplayProps } from './TextareaDisplay';

export { TextareaEdit } from './TextareaEdit';
export type { TextareaEditProps } from './TextareaEdit';

export { validateTextarea } from './Textarea.validator';
export type { ValidationResult } from './Textarea.validator';

export { TextareaTransformer, fromAPI, toAPI } from './Textarea.transformer';

export * from './Textarea.types';
