import test from 'node:test';
import assert from 'node:assert/strict';
import { assertReadingInput, calculateCost, DomainError, Reading } from '../src/domain/Reading';
import { analyzeConsumption } from '../src/domain/Analytics';
const sample = { period: '2026-11', category: 'Iluminación', kwh: 50, pricePerKwh: 900, note: 'Luces LED' };
test('valida un registro correcto', () => {
  assert.equal(assertReadingInput(sample).kwh, 50);
});
test('rechaza consumo negativo', () => {
  assert.throws(() => assertReadingInput({ ...sample, kwh: -1 }), DomainError);
});
test('rechaza períodos inválidos', () => {
  assert.throws(() => assertReadingInput({ ...sample, period: '2026-13' }), DomainError);
});
test('calcula costos en COP correctamente', () => {
  assert.equal(calculateCost(sample), 45000);
});
test('calcula panel y regla de meta superada', () => {
  const reading: Reading = { ...assertReadingInput(sample), id: '1', createdAt: new Date().toISOString() };
  const dashboard = analyzeConsumption([reading], 40, new Date('2026-11-09T12:00:00Z'));
  assert.equal(dashboard.currentKwh, 50);
  assert.equal(dashboard.currentCost, 45000);
  assert.ok(dashboard.suggestions.some(item => item.includes('Superaste')));
});
test('el panel sin datos no divide por cero', () => {
  const dashboard = analyzeConsumption([], 300, new Date('2026-11-09T12:00:00Z'));
  assert.equal(dashboard.currentKwh, 0);
  assert.equal(dashboard.changePercent, null);
  assert.deepEqual(dashboard.categories, []);
});
