/**
 * Pimcore Instance Types
 */

export interface PimcoreInstance {
  id: string;
  name: string;
  url: string;
  description?: string;
  color?: string; // Optional color for visual distinction
  createdAt: number;
}
