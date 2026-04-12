import { format, formatDistanceToNow, parseISO, isSameYear } from 'date-fns';

/**
 * Formats an ISO date string to a human-readable date (e.g. "Jan 15, 2026").
 * Returns `'-'` when the input is null, undefined, or empty.
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    return format(parseISO(isoString), 'MMM d, yyyy');
  } catch {
    return '-';
  }
}

/**
 * Formats an ISO date string to a human-readable date and time
 * (e.g. "Jan 15, 2026, 2:30 PM").
 * Returns `'-'` when the input is null, undefined, or empty.
 */
export function formatDateTime(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    return format(parseISO(isoString), 'MMM d, yyyy, h:mm a');
  } catch {
    return '-';
  }
}

/**
 * Formats an ISO date string as a relative time string (e.g. "2 hours ago").
 * Returns `'-'` when the input is null, undefined, or empty.
 */
export function formatRelative(isoString: string | null | undefined): string {
  if (!isoString) return '-';
  try {
    return formatDistanceToNow(parseISO(isoString), { addSuffix: true });
  } catch {
    return '-';
  }
}

/**
 * Formats a date range as a concise string.
 *
 * - Same year: `"Jan 1 - Jan 5, 2026"`
 * - Different years: `"Dec 28, 2025 - Jan 2, 2026"`
 */
export function formatDateRange(start: string, end: string): string {
  try {
    const startDate = parseISO(start);
    const endDate = parseISO(end);

    if (isSameYear(startDate, endDate)) {
      return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
    }

    return `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`;
  } catch {
    return '-';
  }
}
