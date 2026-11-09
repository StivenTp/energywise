import { CATEGORIES, Reading, calculateCost } from './Reading';
export interface MonthlyPoint { period: string; kwh: number; cost: number }
export interface CategoryPoint { category: string; kwh: number; percent: number }
export interface Dashboard {
  currentMonth: string;
  currentKwh: number;
  currentCost: number;
  previousKwh: number;
  changePercent: number | null;
  goalKwh: number;
  goalProgress: number;
  monthly: MonthlyPoint[];
  categories: CategoryPoint[];
  readingCount: number;
  suggestions: string[];
}
export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
export function recentPeriods(count: number, date: Date = new Date()): string[] {
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - (count - 1 - i), 1));
    return monthKey(d);
  });
}
const round = (value: number): number => Math.round(value * 100) / 100;
/** Estrategia pura de análisis: sin acceso a red, HTTP ni base de datos. */
export function analyzeConsumption(readings: Reading[], goalKwh: number, date: Date = new Date()): Dashboard {
  const periods = recentPeriods(6, date);
  const monthly = periods.map(period => {
    const entries = readings.filter(reading => reading.period === period);
    return {
      period,
      kwh: round(entries.reduce((sum, item) => sum + item.kwh, 0)),
      cost: round(entries.reduce((sum, item) => sum + calculateCost(item), 0))
    };
  });
  const current = monthly[5];
  const previous = monthly[4];
  const currentReadings = readings.filter(item => item.period === current.period);
  const allKwh = currentReadings.reduce((sum, item) => sum + item.kwh, 0);
  const categories = CATEGORIES.map(category => {
    const kwh = currentReadings.filter(item => item.category === category)
      .reduce((sum, item) => sum + item.kwh, 0);
    return { category, kwh: round(kwh), percent: allKwh > 0 ? round(kwh / allKwh * 100) : 0 };
  }).filter(item => item.kwh > 0).sort((a, b) => b.kwh - a.kwh);
  const suggestions: string[] = [];
  if (readings.length === 0) {
    suggestions.push('Registra tu primer consumo o carga los datos de ejemplo para comenzar el análisis.');
  } else if (current.kwh === 0) {
    suggestions.push('Todavía no tienes registros este mes. Añade una lectura para obtener recomendaciones.');
  } else {
    suggestions.push(current.kwh > goalKwh
      ? 'Superaste tu meta mensual. Prioriza los equipos de mayor consumo.'
      : 'Tu consumo actual está dentro de la meta mensual establecida.');
    if (previous.kwh > 0 && current.kwh > previous.kwh * 1.2) {
      suggestions.push('Tu consumo subió más de un 20 % respecto al mes anterior. Revisa posibles desperdicios.');
    }
    if (categories.length > 0) {
      suggestions.push(`${categories[0].category} representa la categoría de mayor consumo este mes.`);
    }
  }
  return {
    currentMonth: current.period,
    currentKwh: current.kwh,
    currentCost: current.cost,
    previousKwh: previous.kwh,
    changePercent: previous.kwh > 0 ? round(((current.kwh - previous.kwh) / previous.kwh) * 100) : null,
    goalKwh,
    goalProgress: round(current.kwh / goalKwh * 100),
    monthly, categories, readingCount: readings.length, suggestions
  };
}
