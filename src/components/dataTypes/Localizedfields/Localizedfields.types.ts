/**
 * Type definitions for Localizedfields data type
 * 
 * Localizedfields contain fields that can have different values per language.
 * The structure is: { [languageCode: string]: { [fieldName: string]: any } }
 */

export interface LocalizedValue {
  [languageCode: string]: {
    [fieldName: string]: any;
  };
}

export interface LocalizedfieldsConfig {
  name: string;
  title: string;
  label?: string;
  type: 'localizedfields';
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  children?: LocalizedFieldDefinition[];
  referencedFields?: LocalizedFieldDefinition[];
  fieldDefinitions?: LocalizedFieldDefinition[];
}

export interface LocalizedFieldDefinition {
  name: string;
  title: string;
  fieldtype: string;
  type?: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  [key: string]: any;
}

export interface Language {
  code: string;
  name: string;
  default?: boolean;
}
