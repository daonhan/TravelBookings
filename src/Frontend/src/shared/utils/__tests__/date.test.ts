import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatDate, formatDateTime, formatRelative, formatDateRange } from '../date';

describe('formatDate', () => {
  it('formats a valid ISO string to human-readable date', () => {
    expect(formatDate('2026-01-15T10:30:00Z')).toBe('Jan 15, 2026');
  });

  it('formats another date correctly', () => {
    expect(formatDate('2025-12-25T00:00:00Z')).toBe('Dec 25, 2025');
  });

  it('returns "-" for null', () => {
    expect(formatDate(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatDate(undefined)).toBe('-');
  });

  it('returns "-" for empty string', () => {
    expect(formatDate('')).toBe('-');
  });

  it('returns "-" for an invalid date string', () => {
    expect(formatDate('not-a-date')).toBe('-');
  });
});

describe('formatDateTime', () => {
  it('formats a valid ISO string to date and time', () => {
    const result = formatDateTime('2026-01-15T14:30:00Z');
    // The exact output depends on the local timezone offset, but it should
    // contain the date parts and a time in h:mm a format.
    expect(result).toContain('2026');
    expect(result).toMatch(/\d{1,2}:\d{2}\s[AP]M/);
  });

  it('returns "-" for null', () => {
    expect(formatDateTime(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatDateTime(undefined)).toBe('-');
  });

  it('returns "-" for empty string', () => {
    expect(formatDateTime('')).toBe('-');
  });

  it('returns "-" for an invalid date string', () => {
    expect(formatDateTime('garbage')).toBe('-');
  });
});

describe('formatRelative', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns a relative time string with "ago" suffix', () => {
    // Set a fixed "now" so the relative output is deterministic
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'));

    const result = formatRelative('2026-06-15T11:00:00Z');
    expect(result).toContain('ago');
  });

  it('returns "-" for null', () => {
    expect(formatRelative(null)).toBe('-');
  });

  it('returns "-" for undefined', () => {
    expect(formatRelative(undefined)).toBe('-');
  });

  it('returns "-" for empty string', () => {
    expect(formatRelative('')).toBe('-');
  });
});

describe('formatDateRange', () => {
  it('formats same-year range without repeating the year on the start', () => {
    const result = formatDateRange('2026-01-01T00:00:00Z', '2026-01-05T00:00:00Z');
    expect(result).toBe('Jan 1 - Jan 5, 2026');
  });

  it('formats cross-year range with year on both dates', () => {
    const result = formatDateRange('2025-12-28T00:00:00Z', '2026-01-02T00:00:00Z');
    expect(result).toBe('Dec 28, 2025 - Jan 2, 2026');
  });

  it('returns "-" for invalid inputs', () => {
    expect(formatDateRange('bad', 'worse')).toBe('-');
  });
});
