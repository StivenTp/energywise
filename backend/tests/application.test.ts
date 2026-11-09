import test from 'node:test';
import assert from 'node:assert/strict';
import { Reading, ReadingInput } from '../src/domain/Reading';
import { ReadingRepository } from '../src/application/ports/ReadingRepository';
import { ReadingService } from '../src/application/ReadingService';
import { DashboardService } from '../src/application/DashboardService';
import { buildDemoReadings } from '../src/application/demo/buildDemoReadings';

class InMemoryReadingRepository implements ReadingRepository {
  private readings: Reading[] = [];
  async findAll(): Promise<Reading[]> { return [...this.readings]; }
  async count(): Promise<number> { return this.readings.length; }
  async create(input: ReadingInput): Promise<Reading> {
    const reading = { ...input, id: String(this.readings.length + 1), createdAt: new Date().toISOString() };
    this.readings.push(reading);
    return reading;
  }
  async createMany(inputs: ReadingInput[]): Promise<number> {
    for (const input of inputs) await this.create(input);
    return inputs.length;
  }
  async update(id: string, input: ReadingInput): Promise<Reading | null> {
    const i = this.readings.findIndex(reading => reading.id === id);
    if (i === -1) return null;
    this.readings[i] = { ...this.readings[i], ...input };
    return this.readings[i];
  }
  async delete(id: string): Promise<boolean> {
    const oldCount = this.readings.length;
    this.readings = this.readings.filter(reading => reading.id !== id);
    return oldCount !== this.readings.length;
  }
}

test('generador produce 24 lecturas válidas para seis meses', () => {
  const readings = buildDemoReadings(['2026-01','2026-02','2026-03','2026-04','2026-05','2026-06']);
  assert.equal(readings.length, 24);
  assert.equal(readings.filter(r => r.period === '2026-01').length, 4);
});
test('cargar ejemplos es idempotente cuando existen lecturas', async () => {
  const repo = new InMemoryReadingRepository();
  const service = new ReadingService(repo);
  assert.equal(await service.seedExamples(), 24);
  assert.equal(await service.seedExamples(), 0);
  assert.equal(await repo.count(), 24);
});
test('sustitución LSP: servicio funciona con repositorio en memoria', async () => {
  const repo = new InMemoryReadingRepository();
  const service = new ReadingService(repo);
  const input = { period:'2026-11', category:'Tecnología', kwh:25, pricePerKwh:800, note:'PC' };
  const reading = await service.create(input);
  assert.equal((await service.list()).length, 1);
  assert.equal((await new DashboardService(repo).execute(100)).currentKwh, 25);
  assert.equal((await service.update(reading.id, {...input,kwh:30}))?.kwh,30);
  assert.equal(await service.remove(reading.id),true);
  assert.equal((await service.list()).length,0);
});
