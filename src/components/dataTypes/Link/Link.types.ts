/**
 * Type definitions for Pimcore Link Data Type
 * Based on: https://github.com/pimcore/studio-ui-bundle/blob/1.x/assets/js/src/core/modules/element/dynamic-types/definitions/objects/data-related/components/link/link.tsx
 */

/**
 * Link value structure as returned by Pimcore API
 */
export interface LinkValue {
  text: string;
  linktype: 'direct' | 'internal';
  direct?: string | null;
  internal?: number | null;
  internalType?: string | null;
  fullPath?: string;
  target: string | null;
  parameters: string;
  anchor: string;
  title: string;
  accesskey: string;
  rel: string;
  tabindex: string;
  class: string;
}

/**
 * Configuration for Link field
 */
export interface LinkConfig {
  label: string;
  allowedTypes?: string[] | null;
  allowedTargets?: string[] | null;
  disabledFields?: string[] | null;
  required?: boolean;
  noteditable?: boolean;
}

/**
 * Props for Link Display Component
 */
export interface LinkDisplayProps {
  value: LinkValue | null;
  config: LinkConfig;
  inherited?: boolean;
  textPrefix?: string;
  textSuffix?: string;
}

/**
 * Props for Link Edit Component
 */
export interface LinkEditProps {
  value: LinkValue | null;
  onChange: (value: LinkValue | null) => void;
  config: LinkConfig;
  error?: string;
  readonly?: boolean;
}
