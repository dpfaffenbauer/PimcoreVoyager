/**
 * Utility Functions
 *
 * Re-exports compatible utilities from @pimcore/studio-ui-bundle
 * and provides React Native compatible implementations where needed.
 */

// Re-export pure utility functions that work in React Native
// Note: Some utils have i18next dependency, so we provide our own implementations

export { uuid } from '@pimcore/studio-ui-bundle/utils';

// Re-export hooks that work in React Native
export { usePrevious } from '@pimcore/studio-ui-bundle/utils';
export { useDebounce } from '@pimcore/studio-ui-bundle/utils';

/**
 * Format a number with locale support
 * React Native compatible implementation
 */
export function formatNumber(
  value: number | undefined | null,
  options?: Intl.NumberFormatOptions,
  locale?: string
): string {
  if (value === undefined || value === null) {
    return '';
  }

  const lng = locale || 'en';
  return new Intl.NumberFormat(lng, {
    useGrouping: false,
    ...options,
  }).format(value);
}

/**
 * Format a currency value
 * React Native compatible implementation
 */
export function formatCurrency(
  value: number,
  currency: string = 'EUR',
  locale?: string
): string {
  const lng = locale || 'en';
  return new Intl.NumberFormat(lng, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format a date/time value
 * React Native compatible implementation
 */
export function formatDateTime(
  timestamp: number | string | null,
  options?: {
    timeStyle?: 'short' | 'medium' | 'long' | 'full';
    dateStyle?: 'short' | 'medium' | 'long' | 'full';
    locale?: string;
  }
): string {
  if (timestamp === null) {
    return '';
  }

  try {
    const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
    const lng = options?.locale || 'en';

    return new Intl.DateTimeFormat(lng, {
      timeStyle: options?.timeStyle,
      dateStyle: options?.dateStyle,
    }).format(date);
  } catch (error) {
    console.error('Failed to format date time:', error);
    return '';
  }
}

/**
 * Format a date value (short format)
 */
export function formatDate(timestamp: number | string): string {
  return formatDateTime(timestamp, { dateStyle: 'short' });
}

/**
 * Format a time value (short format)
 */
export function formatTime(timestamp: number | string): string {
  return formatDateTime(timestamp, { timeStyle: 'short' });
}

/**
 * Format a relative time (e.g., "2 hours ago")
 * React Native compatible implementation
 */
export function formatRelativeTime(
  timestamp: number | string,
  locale?: string
): string {
  const date = new Date(typeof timestamp === 'number' ? timestamp * 1000 : timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const lng = locale || 'en';
  const rtf = new Intl.RelativeTimeFormat(lng, { numeric: 'auto' });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second');
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month');
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year');
  }
}

/**
 * Format file size in human readable format
 */
export function formatDataUnit(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Check if a value is nil (null or undefined)
 */
export function isNil(value: unknown): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Check if a value is empty (null, undefined, empty string, empty array, empty object)
 */
export function isEmpty(value: unknown): boolean {
  if (isNil(value)) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Compose multiple functions into one
 */
export function compose<T>(...fns: Array<(arg: T) => T>): (arg: T) => T {
  return (arg: T) => fns.reduceRight((acc, fn) => fn(acc), arg);
}

/**
 * Parse query string into object
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const params = new URLSearchParams(queryString);
  const result: Record<string, string> = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, string | number | boolean | undefined>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
}
