import { assertReadingInput, ReadingInput } from '../../domain/Reading';

/** Refactorización: generación determinista separada del caso de uso y de MongoDB. */
export function buildDemoReadings(periods: readonly string[]): ReadingInput[] {
  const factors = [1.22, 1.09, 1.16, 1.01, 1.13, 0.9];
  return periods.flatMap((period, index) => {
    const factor = factors[index % factors.length];
    return [
      { period, category: 'Climatización', kwh: Math.round(110 * factor), pricePerKwh: 890, note: 'Aire acondicionado' },
      { period, category: 'Electrodomésticos', kwh: Math.round(91 * factor), pricePerKwh: 890, note: 'Refrigerador y cocina' },
      { period, category: 'Iluminación', kwh: Math.round(43 * factor), pricePerKwh: 890, note: 'Iluminación del hogar' },
      { period, category: 'Tecnología', kwh: Math.round(31 * factor), pricePerKwh: 890, note: 'Equipos y computadores' }
    ].map(item => assertReadingInput(item));
  });
}
