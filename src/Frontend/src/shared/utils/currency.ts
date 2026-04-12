const formatterCache = new Map<string, Intl.NumberFormat>();

function getFormatter(currency: string): Intl.NumberFormat {
  let formatter = formatterCache.get(currency);
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    formatterCache.set(currency, formatter);
  }
  return formatter;
}

/**
 * Formats a numeric amount as a currency string.
 *
 * @param amount  - The monetary value to format.
 * @param currency - ISO 4217 currency code (default: `'USD'`).
 * @returns A locale-formatted currency string, e.g. `"$1,234.56"`.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  return getFormatter(currency).format(amount);
}
