/**
 * Date Utilities
 *
 * Shared date parsing and formatting to avoid timezone issues.
 * parseLocalDate creates dates in local timezone (not UTC).
 */

/** Parse a YYYY-MM-DD string as a local date (avoids UTC timezone shift) */
export function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/** Format a YYYY-MM-DD string as "Wednesday, February 11" */
export function formatDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/** Format a YYYY-MM-DD string as "Feb 11" (short form) */
export function formatDateShort(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

/** Get the day-of-week name from a YYYY-MM-DD string */
export function getDayOfWeek(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
}
