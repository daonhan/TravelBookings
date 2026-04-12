import { describe, it, expect } from 'vitest';
import { generateCorrelationId } from '../correlation-id';

describe('generateCorrelationId', () => {
  const UUID_V4_REGEX =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  it('returns a valid UUID v4 format', () => {
    const id = generateCorrelationId();
    expect(id).toMatch(UUID_V4_REGEX);
  });

  it('returns a string', () => {
    const id = generateCorrelationId();
    expect(typeof id).toBe('string');
  });

  it('each call returns a unique value', () => {
    const ids = new Set(
      Array.from({ length: 100 }, () => generateCorrelationId()),
    );
    expect(ids.size).toBe(100);
  });

  it('the version nibble is always 4', () => {
    const id = generateCorrelationId();
    // The 13th character (index 14 after hyphens) should be '4'
    const parts = id.split('-');
    expect(parts[2]![0]).toBe('4');
  });

  it('the variant nibble is one of 8, 9, a, b', () => {
    const id = generateCorrelationId();
    const parts = id.split('-');
    const variantChar = parts[3]![0]!.toLowerCase();
    expect(['8', '9', 'a', 'b']).toContain(variantChar);
  });
});
