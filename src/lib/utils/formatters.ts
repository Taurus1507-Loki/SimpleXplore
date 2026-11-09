/**
 * Currency and numbers formatting for SimpleXplore
 * Defaults to Indian Rupee (INR / ₹) with support for multi-currency scaling
 */

export function formatPrice(amount: number, currency: string = 'INR'): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '₹0';
  }

  try {
    if (currency === 'INR') {
      // Indian numbering system: ₹1,499 or ₹1,24,999
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(amount);
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const symbol = currency === 'INR' ? '₹' : currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '';
    return `${symbol}${Math.round(amount).toLocaleString('en-IN')}`;
  }
}

export function calculateDiscountPercentage(currentPrice: number, originalPrice?: number | null): number {
  if (!originalPrice || originalPrice <= currentPrice) return 0;
  return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

