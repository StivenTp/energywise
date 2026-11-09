import { analyzeConsumption, Dashboard } from '../domain/Analytics';
import { DomainError } from '../domain/Reading';
import { ReadingRepository } from './ports/ReadingRepository';
export class DashboardService {
  constructor(private readonly repository: ReadingRepository) {}
  async execute(goal: unknown): Promise<Dashboard> {
    const goalKwh = goal === undefined ? 360 : Number(goal);
    if (!Number.isFinite(goalKwh) || goalKwh < 1 || goalKwh > 1000000) {
      throw new DomainError('La meta debe estar entre 1 y 1.000.000 kWh.');
    }
    return analyzeConsumption(await this.repository.findAll(), goalKwh);
  }
}
