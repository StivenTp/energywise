import { useEffect, useState, type FormEvent } from 'react';
import { X, CalendarDays, Zap } from 'lucide-react';
import { categories, type Reading, type ReadingInput } from '../lib/api';

function thisMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}
const empty = (): ReadingInput => ({
  period: thisMonth(), category: 'Climatización', kwh: 0, pricePerKwh: 890, note: ''
});
interface Props {
  editing: Reading | null;
  onClose: () => void;
  onSave: (reading: ReadingInput) => Promise<void>;
}
export function ReadingModal({ editing, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<ReadingInput>(editing || empty());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { setDraft(editing || empty()); }, [editing]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError('');
    try { await onSave(draft); } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally { setBusy(false); }
  }
  return (
    <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div><div className="eyebrow">CONTROL DE CONSUMO</div><h2 id="modal-title">{editing ? 'Editar registro' : 'Nueva lectura'}</h2></div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Cerrar"><X size={20}/></button>
        </div>
        <p className="muted modal-intro">Registra el consumo energético de un equipo o categoría de tu hogar.</p>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field"><span>Período</span><span className="input-icon"><CalendarDays size={16}/>
              <input required type="month" value={draft.period} onChange={e => setDraft({ ...draft, period: e.target.value })}/>
            </span></label>
            <label className="field"><span>Categoría</span><select value={draft.category} onChange={e => setDraft({ ...draft, category: e.target.value as ReadingInput['category'] })}>
              {categories.map(category => <option key={category}>{category}</option>)}
            </select></label>
            <label className="field"><span>Consumo (kWh)</span><span className="input-icon"><Zap size={16}/>
              <input required min="0.01" max="1000000" step="0.01" type="number" value={draft.kwh || ''} placeholder="Ej: 85" onChange={e => setDraft({ ...draft, kwh: Number(e.target.value) })}/>
            </span></label>
            <label className="field"><span>Tarifa (COP/kWh)</span>
              <input required min="0" max="10000000" step="0.01" type="number" value={draft.pricePerKwh} onChange={e => setDraft({ ...draft, pricePerKwh: Number(e.target.value) })}/>
            </label>
          </div>
          <label className="field"><span>Descripción <span className="muted">(opcional)</span></span>
            <textarea maxLength={180} rows={3} placeholder="Ej: Aire acondicionado de la sala" value={draft.note} onChange={e => setDraft({ ...draft, note: e.target.value })}/>
          </label>
          {error && <p className="alert error" role="alert">{error}</p>}
          <div className="modal-actions"><button type="button" className="button ghost" onClick={onClose}>Cancelar</button><button className="button primary" disabled={busy}>{busy ? 'Guardando...' : editing ? 'Guardar cambios' : 'Agregar lectura'}</button></div>
        </form>
      </div>
    </div>
  );
}
