import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const ACTION_TYPES    = ['SPRAY', 'IRRIGATE', 'HARVEST', 'PRUNE', 'FERTILIZE', 'SCOUT', 'OTHER'];
const CHEMICAL_TYPES  = ['NONE', 'FUNGICIDE', 'INSECTICIDE', 'HERBICIDE', 'FERTILIZER', 'OTHER'];

const ACTION_ICONS = { SPRAY:'💧', IRRIGATE:'🚿', HARVEST:'🌾', PRUNE:'✂️', FERTILIZE:'🌱', SCOUT:'🔍', OTHER:'📋' };
const CHEM_BADGE   = { FUNGICIDE:'bg-red-100 text-red-600', INSECTICIDE:'bg-orange-100 text-orange-600', HERBICIDE:'bg-yellow-100 text-yellow-700', FERTILIZER:'bg-green/20 text-forest', OTHER:'bg-gray-100 text-gray-500' };

function AddActionModal({ token, blocks, onClose, onAdded }) {
  const [form, setForm] = useState({ block_id: '', period: '', action_type: 'SPRAY', chemical_type: 'NONE', quantity: '', cost: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.block_id || !form.period) { setErr('Block and period are required'); return; }
    setLoading(true); setErr('');
    try {
      await apiFetch('/actions/create/', token, {
        method: 'POST',
        body: JSON.stringify({
          block_id:     form.block_id,
          period:       form.period,
          action_type:  form.action_type,
          chemical_type: form.chemical_type,
          quantity:     form.quantity ? parseFloat(form.quantity) : null,
          cost:         form.cost     ? parseFloat(form.cost)     : null,
          notes:        form.notes,
        }),
      });
      onAdded(); onClose();
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const field = (label, children) => (
    <div className="mb-4">
      <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
  const input = (props) => <input {...props} className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest" />;
  const sel   = (val, onChange, opts) => (
    <select value={val} onChange={e => onChange(e.target.value)}
      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest text-dark">
      {opts}
    </select>
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="font-serif text-xl text-forest mb-5">Add Action</div>

        {field('Block', sel(form.block_id, v => set('block_id', v), [
          <option key="" value="">Select block…</option>,
          ...blocks.map(b => <option key={b.id} value={b.id}>{b.name} — {b.farm_name}</option>)
        ]))}

        {field('Period (e.g. 2024-Q1 or 2024-03)',
          input({ type: 'text', placeholder: '2024-Q1', value: form.period, onChange: e => set('period', e.target.value) })
        )}

        {field('Action Type', sel(form.action_type, v => set('action_type', v),
          ACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)
        ))}

        {field('Chemical Type', sel(form.chemical_type, v => set('chemical_type', v),
          CHEMICAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)
        ))}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">Quantity (L/kg)</label>
            {input({ type: 'number', placeholder: '50', value: form.quantity, onChange: e => set('quantity', e.target.value) })}
          </div>
          <div>
            <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">Cost (€)</label>
            {input({ type: 'number', placeholder: '500', value: form.cost, onChange: e => set('cost', e.target.value) })}
          </div>
        </div>

        {field('Notes',
          <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Optional notes…"
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest resize-none" />
        )}

        {err && <div className="text-red-500 text-xs mb-4">{err}</div>}

        <div className="flex gap-3">
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2.5 bg-forest text-white rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-50 transition-opacity">
            {loading ? 'Saving…' : 'Save Action'}
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 text-gray-500 rounded-lg text-sm cursor-pointer hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ActionsList({ token }) {
  const [actions, setActions] = useState([]);
  const [blocks, setBlocks]   = useState([]);
  const [blockId, setBlockId] = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadActions = () => {
    setLoading(true);
    const params = blockId ? `?block_id=${blockId}` : '';
    apiFetch(`/actions/${params}`, token)
      .then(d => setActions(d.actions ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    apiFetch('/blocks/', token).then(d => setBlocks(d.blocks ?? [])).catch(() => {});
  }, [token]);

  useEffect(() => { loadActions(); }, [token, blockId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="font-serif text-2xl text-forest">Actions <span className="text-green text-base font-normal">({actions.length})</span></div>
        <div className="flex gap-3">
          <select value={blockId} onChange={e => setBlockId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest text-dark">
            <option value="">All Blocks</option>
            {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-forest text-white rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
            + Add Action
          </button>
        </div>
      </div>

      {loading && <Spinner />}
      {err     && <Err msg={err} />}
      {!loading && !err && actions.length === 0 && <Empty text="No actions recorded" />}

      {actions.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Action</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Block</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Period</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Chemical</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Qty</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Cost</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a, i) => (
                <tr key={a.id} className={`hover:bg-gray-50 transition-colors ${i < actions.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2">
                      <span>{ACTION_ICONS[a.action_type] ?? '📋'}</span>
                      <span className="text-dark font-medium">{a.action_type}</span>
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="text-dark">{a.block_name}</div>
                    <div className="text-gray-400 text-xs">{a.farm_name}</div>
                  </td>
                  <td className="px-5 py-3">
                    <span className="bg-green/20 text-forest text-xs px-2 py-0.5 rounded-full font-medium">{a.period}</span>
                  </td>
                  <td className="px-5 py-3">
                    {a.chemical_type && a.chemical_type !== 'NONE'
                      ? <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CHEM_BADGE[a.chemical_type] ?? 'bg-gray-100 text-gray-500'}`}>{a.chemical_type}</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{a.quantity ? `${a.quantity} L/kg` : '—'}</td>
                  <td className="px-5 py-3 text-gray-500">{a.cost ? `€${a.cost}` : '—'}</td>
                  <td className="px-5 py-3 text-gray-400 text-xs max-w-xs truncate">{a.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddActionModal
          token={token}
          blocks={blocks}
          onClose={() => setShowModal(false)}
          onAdded={loadActions}
        />
      )}
    </div>
  );
}

function Spinner() { return <div className="text-green text-sm py-8 text-center">Loading…</div>; }
function Err({ msg }) { return <div className="text-red-400 text-sm py-8 text-center">{msg}</div>; }
function Empty({ text }) { return <div className="text-gray-400 text-sm py-8 text-center">{text}</div>; }
