import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, CheckCircle2,
  ChevronDown, CircleHelp, Database, Edit3, Gauge, Github, Leaf, Lightbulb,
  Menu, Plus, RefreshCw, Search, Server, Settings2, ShieldCheck,
  Sparkles, Target, Trash2, TrendingUp, X, Zap
} from 'lucide-react';
import { ConsumptionChart } from './components/ConsumptionChart';
import { ReadingModal } from './components/ReadingModal';
import { api, currency, number, type Dashboard, type Reading, type ReadingInput } from './lib/api';

type Tab = 'overview' | 'readings' | 'architecture';
function monthName(period: string) {
  const [year, month] = period.split('-').map(Number);
  return new Intl.DateTimeFormat('es-CO', { month: 'long', year: 'numeric' }).format(new Date(Date.UTC(year, month - 1, 1)));
}
function ReadingsTable({ records, onEdit, onDelete, compact = false }: {
  records: Reading[]; onEdit: (r: Reading) => void; onDelete: (id: string) => void; compact?: boolean;
}) {
  const shown = compact ? records.slice(0, 5) : records;
  if (!shown.length) return <div className="table-empty">No hay registros todavía. Agrega una lectura o carga datos de ejemplo.</div>;
  return <div className="table-scroller"><table className="data-table"><thead><tr>
    <th>PERÍODO</th><th>CATEGORÍA</th><th>DESCRIPCIÓN</th><th>CONSUMO</th><th>COSTO EST.</th><th aria-label="Acciones" />
  </tr></thead><tbody>{shown.map(record => <tr key={record.id}>
    <td className="text-strong">{monthName(record.period)}</td>
    <td><span className="category-tag"><span className="category-dot" />{record.category}</span></td>
    <td className="muted"><span className="ellipsis">{record.note || 'Sin descripción'}</span></td>
    <td className="text-strong">{number(record.kwh)} <span className="small-muted">kWh</span></td>
    <td>{currency(record.kwh * record.pricePerKwh)}</td>
    <td><div className="table-actions"><button title="Editar" aria-label="Editar registro" onClick={() => onEdit(record)}><Edit3 size={16}/></button><button title="Eliminar" aria-label="Eliminar registro" onClick={() => onDelete(record.id)}><Trash2 size={16}/></button></div></td>
  </tr>)}</tbody></table></div>;
}
function App() {
  const [tab, setTab] = useState<Tab>('overview');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Reading | null>(null);
  const [search, setSearch] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [goal, setGoal] = useState(() => {
    const saved = Number(localStorage.getItem('energywise-goal'));
    return Number.isFinite(saved) && saved >= 1 && saved <= 1000000 ? saved : 360;
  });
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(String(goal));
  const refresh = useCallback(async () => {
    try {
      const [items, info] = await Promise.all([api.readings(), api.dashboard(goal)]);
      setReadings(items); setDashboard(info); setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No fue posible obtener los datos.');
    } finally { setLoading(false); }
  }, [goal]);
  useEffect(() => { void refresh(); }, [refresh]);
  const filteredReadings = useMemo(() => readings.filter(item =>
    `${item.period} ${monthName(item.period)} ${item.category} ${item.note}`.toLowerCase().includes(search.toLowerCase())
  ), [readings, search]);
  async function saveReading(input: ReadingInput) {
    if (editing) await api.update(editing.id, input);
    else await api.create(input);
    setModalOpen(false); setEditing(null); await refresh();
  }
  async function deleteReading(id: string) {
    if (!window.confirm('¿Eliminar este registro de consumo? Esta acción no se puede deshacer.')) return;
    try { await api.delete(id); await refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'No se pudo eliminar.'); }
  }
  async function seedExamples() {
    setSeeding(true);
    try { await api.seed(); await refresh(); } catch (err) { setError(err instanceof Error ? err.message : 'No se pudieron cargar ejemplos.'); }
    finally { setSeeding(false); }
  }
  function changeTab(next: Tab) { setTab(next); setMobileMenu(false); }
  function openModal(record: Reading | null = null) { setEditing(record); setModalOpen(true); }
  function saveGoal() {
    const next = Number(goalDraft);
    if (!Number.isFinite(next) || next < 1 || next > 1000000) return;
    setGoal(next); localStorage.setItem('energywise-goal', String(next)); setEditingGoal(false);
  }
  return <div className="app-shell">
    <aside className={`sidebar ${mobileMenu ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-mark"><Zap size={23} fill="currentColor" strokeWidth={2.3}/></div><div><strong>energywise</strong><span>SMART ENERGY</span></div><button className="mobile-close" onClick={() => setMobileMenu(false)} aria-label="Cerrar menú"><X size={21}/></button></div>
      <div className="nav-caption">ESPACIO DE TRABAJO</div>
      <nav className="nav-links" aria-label="Navegación principal">
        <button className={tab === 'overview' ? 'selected' : ''} onClick={() => changeTab('overview')}><Gauge size={19}/> Vista general <span className="nav-active-dot" /></button>
        <button className={tab === 'readings' ? 'selected' : ''} onClick={() => changeTab('readings')}><BarChart3 size={19}/> Mis consumos</button>
        <button className={tab === 'architecture' ? 'selected' : ''} onClick={() => changeTab('architecture')}><Database size={19}/> Arquitectura</button>
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-tip"><div className="tip-icon"><Leaf size={19}/></div><strong>Pequeños cambios,<br/>gran impacto.</strong><p>Controla tu energía y toma mejores decisiones cada mes.</p><button onClick={() => changeTab('readings')}>Ver mis registros <ArrowRight size={15}/></button></div>
      <div className="sidebar-bottom"><span className="status-dot"/> Base de datos: MongoDB Atlas</div>
    </aside>
    {mobileMenu && <button className="mobile-overlay" aria-label="Cerrar navegación" onClick={() => setMobileMenu(false)}/>}
    <main className="main-content">
      <header className="topbar"><button className="hamburger" onClick={() => setMobileMenu(true)} aria-label="Abrir menú"><Menu size={24}/></button><div className="breadcrumbs"><span>Mi espacio</span><span className="crumb-chevron">/</span><strong>{tab === 'overview' ? 'Vista general' : tab === 'readings' ? 'Mis consumos' : 'Arquitectura'}</strong></div><div className="top-actions"><span className="top-date">{new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}</span><div className="avatar" title="Proyecto académico">EW</div></div></header>
      <div className="content-width">
        {error && <div className="alert error global-error" role="alert"><span>{error}</span><button onClick={() => void refresh()}><RefreshCw size={16}/> Reintentar</button></div>}
        {tab === 'overview' && <>
          <section className="page-heading"><div><div className="eyebrow accent-eyebrow"><Sparkles size={14}/> TU ENERGÍA EN PERSPECTIVA</div><h1>Tu energía, bajo control<span className="green-dot">.</span></h1><p>Entiende tus hábitos de consumo y encuentra nuevas formas de ahorrar.</p></div><button className="button primary" onClick={() => openModal()}><Plus size={19}/> Nueva lectura</button></section>
          <section className="welcome-banner"><div><span className="banner-pill"><span className="pulse-dot"/> PANEL INTELIGENTE</span><h2>Cada kilovatio cuenta.</h2><p>Conoce cuánto consumes, identifica oportunidades y construye un futuro más eficiente.</p><button onClick={() => changeTab('readings')}>Explorar consumos <ArrowRight size={17}/></button></div><div className="orb-decoration"><div className="orb-inner"><Zap size={61} strokeWidth={1.4}/></div></div></section>
          <section className="metric-grid" aria-label="Indicadores de consumo">
            <div className="metric-card"><div className="metric-upper"><span>Consumo este mes</span><div className="metric-icon green"><Zap size={20}/></div></div><div className="metric-value">{loading ? '...' : number(dashboard?.currentKwh || 0)}<small>kWh</small></div><div className="metric-foot">{dashboard?.changePercent === null || dashboard?.changePercent === undefined ? <span className="muted">Sin comparación anterior</span> : <span className={(dashboard?.changePercent ?? 0) > 0 ? 'trend negative' : 'trend positive'}>{(dashboard?.changePercent ?? 0) > 0 ? <ArrowUpRight size={15}/> : <ArrowDownRight size={15}/>} {Math.abs(dashboard?.changePercent ?? 0)}% frente al mes anterior</span>}</div></div>
            <div className="metric-card"><div className="metric-upper"><span>Costo estimado</span><div className="metric-icon blue"><Activity size={20}/></div></div><div className="metric-value cost-value">{loading ? '...' : currency(dashboard?.currentCost || 0)}</div><div className="metric-foot muted">Calculado con las tarifas registradas</div></div>
            <div className="metric-card"><div className="metric-upper"><span>Meta mensual</span><div className="metric-icon orange"><Target size={20}/></div></div><div className="metric-value">{number(goal, 0)}<small>kWh</small></div><div className="metric-foot"><div className="inline-progress"><div style={{ width: `${Math.min(100, dashboard?.goalProgress || 0)}%` }}/></div><span className="small-muted">{number(dashboard?.goalProgress || 0, 0)}% utilizado</span></div></div>
            <div className="metric-card"><div className="metric-upper"><span>Lecturas registradas</span><div className="metric-icon purple"><TrendingUp size={20}/></div></div><div className="metric-value">{loading ? '...' : dashboard?.readingCount || 0}</div><div className="metric-foot muted">Historial guardado en MongoDB</div></div>
          </section>
          <section className="analytics-grid">
            <div className="panel chart-panel"><div className="panel-header"><div><h3>Evolución del consumo</h3><p>Consumo en kWh durante los últimos 6 meses</p></div><span className="panel-chip"><span className="chip-dot"/> Mensual <ChevronDown size={14}/></span></div><ConsumptionChart data={dashboard?.monthly || []}/><div className="chart-legend"><span className="legend-square"/> Consumo energético (kWh)</div></div>
            <div className="panel breakdown-panel"><div className="panel-header"><div><h3>Distribución de energía</h3><p>Por categoría · este mes</p></div><div className="icon-motif"><BarChart3 size={20}/></div></div>{(dashboard?.categories.length || 0) > 0 ? <div className="breakdown-list">{dashboard?.categories.map((item, index) => <div key={item.category} className="breakdown-item"><div className="breakdown-top"><span><i className={`breakdown-dot dot-${index}`}/>{item.category}</span><strong>{number(item.percent, 0)}%</strong></div><div className="progress"><div className={`fill fill-${index}`} style={{ width: `${item.percent}%` }}/></div><small>{number(item.kwh)} kWh</small></div>)}</div> : <div className="no-breakdown"><BarChart3 size={34}/><p>Agrega lecturas del mes para visualizar la distribución.</p></div>}</div>
          </section>
          <section className="bottom-grid"><div className="panel insights-panel"><div className="panel-header"><div><h3><Lightbulb size={19}/> Recomendaciones inteligentes</h3><p>Información basada en tus datos reales</p></div></div><div className="insight-list">{(dashboard?.suggestions || ['Conecta tu base de datos para obtener recomendaciones.']).map((message, index) => <div className="insight" key={index}><div className="insight-check"><CheckCircle2 size={19}/></div><p>{message}</p></div>)}</div><div className="goal-control"><div><strong>Tu objetivo mensual</strong><p>Personaliza tu meta de ahorro</p></div>{editingGoal ? <div className="goal-edit"><input aria-label="Nueva meta en kWh" type="number" min="1" max="1000000" value={goalDraft} onChange={e => setGoalDraft(e.target.value)}/><button onClick={saveGoal}>Guardar</button></div> : <button onClick={() => { setGoalDraft(String(goal)); setEditingGoal(true); }}><Settings2 size={16}/> Ajustar</button>}</div></div>
          <div className="panel quickstart-panel"><div className="quickstart-icon"><Leaf size={25}/></div><h3>El ahorro empieza con información</h3><p>Registra tus hábitos de consumo y observa cómo evoluciona tu eficiencia mes a mes.</p>{readings.length === 0 ? <button onClick={() => void seedExamples()} disabled={seeding}>{seeding ? 'Cargando...' : 'Cargar datos de ejemplo'} <ArrowRight size={17}/></button> : <button onClick={() => changeTab('readings')}>Consultar historial <ArrowRight size={17}/></button>}<div className="quickstart-decoration"><Zap size={130} strokeWidth={0.7}/></div></div></section>
          <section className="panel recent-panel"><div className="panel-header"><div><h3>Registros recientes</h3><p>Últimas lecturas agregadas a tu cuenta de demostración</p></div><button className="text-link" onClick={() => changeTab('readings')}>Ver todos <ArrowRight size={17}/></button></div><ReadingsTable records={readings} compact onEdit={openModal} onDelete={id => void deleteReading(id)}/></section>
        </>}
        {tab === 'readings' && <><section className="page-heading"><div><div className="eyebrow accent-eyebrow"><BarChart3 size={15}/> HISTORIAL ENERGÉTICO</div><h1>Mis consumos<span className="green-dot">.</span></h1><p>Gestiona las lecturas y consulta el historial de consumo.</p></div><button className="button primary" onClick={() => openModal()}><Plus size={19}/> Nueva lectura</button></section><section className="panel records-panel"><div className="panel-header records-header"><div><h3>Historial de lecturas</h3><p>{readings.length} registros almacenados en MongoDB</p></div><div className="search-wrapper"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar categoría o nota..." aria-label="Buscar registros"/></div></div><ReadingsTable records={filteredReadings} onEdit={openModal} onDelete={id => void deleteReading(id)}/>{readings.length === 0 && <div className="empty-button"><button className="button secondary" onClick={() => void seedExamples()} disabled={seeding}>{seeding ? 'Cargando...' : 'Cargar datos de ejemplo'}</button></div>}</section></>}
        {tab === 'architecture' && <><section className="page-heading"><div><div className="eyebrow accent-eyebrow"><ShieldCheck size={15}/> ARQUITECTURA DE SOFTWARE</div><h1>Construido para evolucionar<span className="green-dot">.</span></h1><p>EnergyWise aplica arquitectura hexagonal, principios SOLID y separación de responsabilidades.</p></div></section><div className="architecture-grid"><div className="panel arch-card"><div className="arch-icon"><Server size={24}/></div><h3>Adaptadores de entrada</h3><p>React consume una API REST de Express. Las rutas HTTP delegan el comportamiento a los casos de uso.</p><span>Frontend + API REST</span></div><div className="panel arch-card"><div className="arch-icon"><Target size={24}/></div><h3>Dominio y aplicación</h3><p>Entidades, validación, cálculos y servicios independientes de frameworks y persistencia.</p><span>Reglas puras + casos de uso</span></div><div className="panel arch-card"><div className="arch-icon"><Database size={24}/></div><h3>Adaptadores de salida</h3><p>El repositorio de MongoDB implementa el puerto de persistencia mediante Mongoose.</p><span>MongoDB Atlas</span></div></div><div className="panel architecture-flow"><h3>Flujo de una solicitud</h3><div className="flow-diagram"><div>React <small>Vista</small></div><ArrowRight/><div>Express <small>Entrada</small></div><ArrowRight/><div>Casos de uso <small>Aplicación</small></div><ArrowRight/><div>Puerto <small>Interfaz</small></div><ArrowRight/><div>MongoDB <small>Salida</small></div></div><p>La dependencia siempre apunta al dominio. Cambiar MongoDB por otra base de datos no exige modificar las reglas de negocio.</p></div><div className="panel solid-panel"><h3>Principios SOLID aplicados</h3><div className="solid-grid">{[['S','Responsabilidad única','Servicios y repositorios cumplen una función concreta.'],['O','Abierto/cerrado','Se pueden agregar adaptadores sin modificar los casos de uso.'],['L','Sustitución de Liskov','El puerto permite cambiar implementaciones compatibles.'],['I','Segregación de interfaces','El contrato del repositorio contiene solo las operaciones necesarias.'],['D','Inversión de dependencias','Los servicios dependen de la interfaz y reciben su adaptador por inyección.']].map(([letter,title,desc]) => <div key={letter}><span>{letter}</span><strong>{title}</strong><p>{desc}</p></div>)}</div></div></>}
        <footer className="footer"><span>© {new Date().getFullYear()} EnergyWise · Proyecto académico de Arquitectura de Software</span><span><CircleHelp size={14}/> React + Express + MongoDB + Render <Github size={15}/></span></footer>
      </div>
    </main>
    {modalOpen && <ReadingModal editing={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={saveReading}/>}
  </div>;
}
export default App;
