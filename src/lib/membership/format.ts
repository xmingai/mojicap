/** USD with the visitor's locale conventions ("$2.99", "2,99 $US", "US$ 2,99"). */
export function formatUsd(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "USD" }).format(amount);
}

export function formatDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "long", day: "numeric" }).format(new Date(iso));
}
