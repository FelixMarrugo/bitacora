export function isValidQuantity(value: number | string | null | undefined): boolean {
  if (value === null || value === undefined || value === '') {
    return false;
  }

  const quantity = Number(value);
  return Number.isFinite(quantity)
    && quantity > 0
    && Number(quantity.toFixed(3)) === quantity;
}

export function sumQuantities(values: readonly (number | string)[]): number {
  const total = values.reduce<number>((sum, value) => sum + Number(value), 0);
  return Number(total.toFixed(3));
}
