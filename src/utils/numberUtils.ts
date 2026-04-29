export const formatINR = (value: number | string | null | undefined): string => {
  if (value == null) return '—';
  const numericValue = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(numericValue)) {
    return '₹0';
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(numericValue);
};

export const parseNumber = (value: unknown): number => {
  const num = Number(value);
  return isNaN(num) ? 0 : num;
};
