/**
 * RGBAColor Data Type Types
 * 
 * Represents RGBA color values in Pimcore
 */

/**
 * RGBAColor value structure
 * - r: Red (0-255)
 * - g: Green (0-255)
 * - b: Blue (0-255)
 * - a: Alpha (0-1, where 0 is fully transparent and 1 is fully opaque)
 */
export interface RGBAColorValue {
  r: number;
  g: number;
  b: number;
  a: number;
}

/**
 * Configuration for RGBAColor field
 */
export interface RGBAColorConfig {
  label: string;
  name: string;
  mandatory?: boolean;
  noteditable?: boolean;
  invisible?: boolean;
  defaultValue?: RGBAColorValue;
}

/**
 * Default RGBA color value (transparent black)
 */
export const DEFAULT_RGBA_VALUE: RGBAColorValue = {
  r: 0,
  g: 0,
  b: 0,
  a: 1,
};
