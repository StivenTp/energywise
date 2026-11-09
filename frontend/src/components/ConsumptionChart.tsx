import { type MonthlyPoint, number, periodLabel } from '../lib/api';
interface Props { data: MonthlyPoint[] }
export function ConsumptionChart({ data }: Props) {
  const max = Math.max(400, ...data.map(point => point.kwh)) * 1.15;
  const ticks = [3, 2, 1, 0].map(i => (max / 3) * i);
  return (
    <div className="chart-wrap" role="img" aria-label="Gráfico del consumo energético mensual de los últimos seis meses">
      <div className="chart-y">{ticks.map((tick, i) => <span key={i}>{number(tick, 0)}</span>)}</div>
      <div className="chart-plot">
        <div className="grid-lines"><span/><span/><span/><span/></div>
        <div className="chart-columns">
          {data.map(point => (
            <div className="chart-column" key={point.period} title={`${point.period}: ${number(point.kwh)} kWh`}>
              <div className="bar-track"><div className={`chart-bar ${point.period === data[data.length - 1]?.period ? 'active' : ''}`} style={{ height: `${(point.kwh / max) * 100}%` }}>
                {point.kwh > 0 && <span className="bar-value">{number(point.kwh, 0)}</span>}
              </div></div><span className="chart-month">{periodLabel(point.period)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
