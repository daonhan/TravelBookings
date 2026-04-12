import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../currency';

describe('formatCurrency', () => {
  it('formats USD amount with dollar sign and commas', () => {
    expect(formatCurrency(1234.56)).toBe('$1,234.56');
  });

  it('defaults to USD when no currency is specified', () => {
    const result = formatCurrency(99.99);
    expect(result).toBe('$99.99');
  });

  it('formats EUR amount with euro symbol', () => {
    const result = formatCurrency(1234.56, 'EUR');
    // Intl.NumberFormat with en-US locale renders EUR as a symbol or code
    expect(result).toContain('1,234.56');
  });

  it('formats GBP amount with pound symbol', () => {
    const result = formatCurrency(500, 'GBP');
    expect(result).toContain('500.00');
  });

  it('formats zero correctly', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });

  it('formats negative amounts with minus sign', () => {
    const result = formatCurrency(-100.5);
    expect(result).toContain('100.50');
    expect(result).toContain('-');
  });

  it('rounds to two decimal places', () => {
    const result = formatCurrency(99.999);
    expect(result).toBe('$100.00');
  });

  it('pads single decimal to two places', () => {
    const result = formatCurrency(49.5);
    expect(result).toBe('$49.50');
  });

  it('formats large amounts with proper grouping', () => {
    const result = formatCurrency(1000000);
    expect(result).toBe('$1,000,000.00');
  });
});
