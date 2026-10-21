export function formatNumber(value: number, decimals = 1): string {
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}