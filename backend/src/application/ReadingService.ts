import { assertReadingInput, Reading } from '../domain/Reading';
import { ReadingRepository } from './ports/ReadingRepository';
import { recentPeriods } from '../domain/Analytics';
import { buildDemoReadings } from './demo/buildDemoReadings';
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
    return this.repository.createMany(buildDemoReadings(recentPeriods(6)));
  }
}
