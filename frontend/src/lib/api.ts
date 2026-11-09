export type Category = 'Climatización' | 'Iluminación' | 'Electrodomésticos' | 'Tecnología' | 'Otros';
export const categories: Category[] = ['Climatización', 'Iluminación', 'Electrodomésticos', 'Tecnología', 'Otros'];
export interface ReadingInput { period: string; category: Category; kwh: number; pricePerKwh: number; note: string }
export interface Reading extends ReadingInput { id: string; createdAt: string }
export interface MonthlyPoint { period: string; kwh: number; cost: number }
export interface Dashboard {
  currentMonth: string;
  currentKwh: number;
  currentCost: number;
  previousKwh: number;
  changePercent: number | null;
  goalKwh: number;
  goalProgress: number;
  monthly: MonthlyPoint[];
  categories: { category: string; kwh: number; percent: number }[];
  readingCount: number;
  suggestions: string[];
}
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) }
  });
  if (response.status === 204) return undefined as T;
  const json = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(json.error || `Error HTTP ${response.status}`);
  return json as T;
}
export const api = {
  readings: () => request<Reading[]>('/readings'),
  dashboard: (goal: number) => request<Dashboard>(`/dashboard?goal=${goal}`),
  create: (input: ReadingInput) => request<Reading>('/readings', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: string, input: ReadingInput) => request<Reading>(`/readings/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: string) => request<void>(`/readings/${id}`, { method: 'DELETE' }),
  seed: () => request<{ created: number }>('/demo/seed', { method: 'POST' })
};
export const number = (value: number, maximumFractionDigits = 1) =>
  new Intl.NumberFormat('es-CO', { maximumFractionDigits }).format(value);
export const currency = (value: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(value);
export const periodLabel = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', { month: 'short' }).format(new Date(Date.UTC(year, month - 1, 1))).replace('.', '');
};
