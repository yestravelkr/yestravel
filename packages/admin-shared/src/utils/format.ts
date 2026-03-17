const priceFormatter = new Intl.NumberFormat('ko-KR');

/** Format price with 원 suffix */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount) + '원';
}

/** Format price without suffix */
export function formatPriceRaw(amount: number): string {
  return priceFormatter.format(amount);
}
