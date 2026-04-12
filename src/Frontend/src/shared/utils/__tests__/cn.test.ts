import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn', () => {
  it('merges multiple class strings', () => {
    const result = cn('flex', 'items-center', 'gap-2');
    expect(result).toBe('flex items-center gap-2');
  });

  it('handles conditional classes via clsx syntax', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn('base', isActive && 'active', isDisabled && 'disabled');
    expect(result).toContain('base');
    expect(result).toContain('active');
    expect(result).not.toContain('disabled');
  });

  it('resolves conflicting Tailwind padding classes, last wins', () => {
    const result = cn('p-4', 'p-2');
    expect(result).toBe('p-2');
  });

  it('resolves conflicting Tailwind margin classes', () => {
    const result = cn('mt-4', 'mt-8');
    expect(result).toBe('mt-8');
  });

  it('resolves conflicting Tailwind text color classes', () => {
    const result = cn('text-red-500', 'text-blue-500');
    expect(result).toBe('text-blue-500');
  });

  it('keeps non-conflicting classes from different utilities', () => {
    const result = cn('p-4', 'mt-2', 'text-sm');
    expect(result).toBe('p-4 mt-2 text-sm');
  });

  it('returns empty string for no inputs', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('returns empty string for all falsy inputs', () => {
    const result = cn(undefined, null, false, '');
    expect(result).toBe('');
  });

  it('handles array inputs', () => {
    const result = cn(['flex', 'items-center']);
    expect(result).toContain('flex');
    expect(result).toContain('items-center');
  });

  it('handles object inputs', () => {
    const result = cn({ flex: true, hidden: false, 'items-center': true });
    expect(result).toContain('flex');
    expect(result).toContain('items-center');
    expect(result).not.toContain('hidden');
  });
});
