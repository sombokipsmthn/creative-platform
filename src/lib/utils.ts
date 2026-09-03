/**
 * Formats a number as currency based on the provided currency code.
 * Defaults to KES if no currency is provided.
 *
 * @param value - The amount to format
 * @param currency - The ISO currency code (e.g., 'KES', 'USD')
 * @returns The formatted currency string
 */
export function formatCurrency(value: number, currency: string = 'KES') {
  const locale = currency === 'KES' ? 'en-KE' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export const generateContractNumber = () =>
  `CNT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
