export function formatCurrency(value: number, options?: { decimals?: number }) {
  const decimals = options?.decimals ?? 2;
  return `Rs ${value.toFixed(decimals)}`;
}

