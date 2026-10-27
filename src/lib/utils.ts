import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names and merges conflicting Tailwind CSS classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number as currency based on the provided currency code.
 * Defaults to KES if no currency is provided.
 *
 * @param value - The amount to format
 * @param currency - The ISO currency code (e.g., 'KES', 'USD')
 * @returns The formatted currency string
 */
export function formatCurrency(
  value: number,
  currency: string = "KES",
): string {
  const locale = currency === "KES" ? "en-KE" : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Generates a unique contract number using the current date and a random suffix.
 * Example: KIP-CON-20261020-A1B2C3
 */
export function generateContractNumber(): string {
  const date = new Date();
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");

  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `KIP-CON-${datePart}-${randomPart}`;
}

/**
 * Formats a date string to a localized date format.
 * Defaults to en-KE format (dd MMM yyyy).
 *
 * @param value - The date string to format
 * @param locale - The locale to use (default: en-KE)
 * @returns The formatted date string or '—' if invalid
 */
export function formatDate(
  value: string | null | undefined,
  locale: string = 'en-KE',
): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  return date.toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}