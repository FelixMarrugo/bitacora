import { isValidQuantity, sumQuantities } from './quantity';

describe('quantity utilities', () => {
  it('accepts positive quantities with up to three decimal places', () => {
    expect(isValidQuantity(1)).toBeTrue();
    expect(isValidQuantity(0.125)).toBeTrue();
    expect(isValidQuantity('2.5')).toBeTrue();
  });

  it('rejects empty, non-positive, non-numeric and over-precision values', () => {
    expect(isValidQuantity('')).toBeFalse();
    expect(isValidQuantity(0)).toBeFalse();
    expect(isValidQuantity(-0.2)).toBeFalse();
    expect(isValidQuantity('abc')).toBeFalse();
    expect(isValidQuantity(1.2345)).toBeFalse();
  });

  it('rounds sums to the supported decimal precision', () => {
    expect(sumQuantities([0.1, 0.2])).toBe(0.3);
    expect(sumQuantities([1.125, 2.25])).toBe(3.375);
  });
});
