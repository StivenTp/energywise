import { assertReadingInput, Reading } from '../domain/Reading';
import { ReadingRepository } from './ports/ReadingRepository';
import { recentPeriods } from '../domain/Analytics';
/** Casos de uso: responsabilidad única y dependencias invertidas por constructor. */
export class ReadingService {
  constructor(private readonly repository: ReadingRepository) {}
  async list(): Promise<Reading[]> { return this.repository.findAll(); }
  async create(input: unknown): Promise<Reading> { return this.repository.create(assertReadingInput(input)); }
  async update(id: string, input: unknown): Promise<Reading | null> {
    return this.repository.update(id, assertReadingInput(input));
  }
  async remove(id: string): Promise<boolean> { return this.repository.delete(id); }
  async seedExamples(): Promise<number> {
    if ((await this.repository.count()) !== 0) return 0;
    const periods = recentPeriods(6);
    const demo = periods.flatMap((period, index) => {
      const factor = [1.22, 1.09, 1.16, 1.01, 1.13, 0.9][index];
      return [
        { period, category: 'Climatización', kwh: Math.round(110 * factor), pricePerKwh: 890, note: 'Aire acondicionado' },
        { period, category: 'Electrodomésticos', kwh: Math.round(91 * factor), pricePerKwh: 890, note: 'Refrigerador y cocina' },
        { period, category: 'Iluminación', kwh: Math.round(43 * factor), pricePerKwh: 890, note: 'Iluminación del hogar' },
        { period, category: 'Tecnología', kwh: Math.round(31 * factor), pricePerKwh: 890, note: 'Equipos y computadores' }
      ].map(item => assertReadingInput(item));
    });
    return this.repository.createMany(demo);
  }
}
