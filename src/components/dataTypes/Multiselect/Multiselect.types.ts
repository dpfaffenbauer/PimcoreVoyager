/**
 * Multiselect Type Definitions
 * Pimcore Data Object Type: Multiselect
 */

import { SelectOption } from '../types';

export interface MultiselectValue {
  value: (string | number)[];
}

export interface MultiselectConfig {
  label: string;
  name: string;
  options?: SelectOption[];
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  maxItems?: number | null;
  defaultValue?: (string | number)[] | null;
  allowClear?: boolean;
  placeholder?: string;
}
