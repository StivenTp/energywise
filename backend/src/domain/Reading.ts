/** El dominio no depende de Express, Mongoose ni de ninguna infraestructura. */
export const CATEGORIES = [
  'Climatización', 'Iluminación', 'Electrodomésticos', 'Tecnología', 'Otros'
] as const;
export type Category = typeof CATEGORIES[number];
export interface ReadingInput {
  period: string;
  category: Category;
  kwh: number;
  pricePerKwh: number;
  note: string;
}
export interface Reading extends ReadingInput {
  id: string;
  createdAt: string;
}
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
export function assertReadingInput(payload: unknown): ReadingInput {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new DomainError('Envía un registro válido.');
  }
  const data = payload as Record<string, unknown>;
  const period = data.period;
  if (typeof period !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) {
    throw new DomainError('El período debe tener el formato AAAA-MM.');
  }
  if (!CATEGORIES.includes(data.category as Category)) {
    throw new DomainError('Selecciona una categoría válida.');
  }
  if (typeof data.kwh !== 'number' || !Number.isFinite(data.kwh) || data.kwh <= 0 || data.kwh > 1000000) {
    throw new DomainError('Los kWh deben ser mayores que 0 y menores o iguales a 1.000.000.');
  }
  if (typeof data.pricePerKwh !== 'number' || !Number.isFinite(data.pricePerKwh) || data.pricePerKwh < 0 || data.pricePerKwh > 10000000) {
    throw new DomainError('El precio por kWh debe ser un número entre 0 y 10.000.000.');
  }
  const note = data.note ?? '';
  if (typeof note !== 'string' || note.length > 180) {
    throw new DomainError('La nota no debe superar 180 caracteres.');
  }
  return {
    period, category: data.category as Category,
    kwh: Math.round(data.kwh * 100) / 100,
    pricePerKwh: Math.round(data.pricePerKwh * 100) / 100,
    note: note.trim()
  };
}
export function calculateCost(reading: Pick<ReadingInput, 'kwh' | 'pricePerKwh'>): number {
  return Math.round(reading.kwh * reading.pricePerKwh * 100) / 100;
}
