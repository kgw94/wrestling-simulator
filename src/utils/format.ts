/**
 * Utility functions for safe numerical formatting to prevent
 * null/undefined/NaN exceptions.
 */

export function formatNumber(val: number | null | undefined, fallback: number = 0): string {
  if (val === null || val === undefined || typeof val !== 'number' || isNaN(val)) {
    return fallback.toLocaleString();
  }
  return val.toLocaleString();
}

export function formatCurrency(val: number | null | undefined, fallback: number = 0): string {
  if (val === null || val === undefined || typeof val !== 'number' || isNaN(val)) {
    return `$${fallback.toLocaleString()}`;
  }
  return `$${val.toLocaleString()}`;
}
