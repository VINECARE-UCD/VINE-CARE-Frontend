import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const ACTION_ICONS = {
  SPRAY:      '💧',
  IRRIGATE:   '🚿',
  HARVEST:    '🌾',
  PRUNE:      '✂️',
  FERTILIZE:  '🌱',
  SCOUT:      '🔍',
  OTHER:      '📋',
};

const CHEM_BADGE = {
  FUNGICIDE:   'bg-red-100 text-red-600',
  INSECTICIDE: 'bg-orange-100 text-orange-600',
  HERBICIDE:   'bg-yellow-100 text-yellow-700',
  FERTILIZER:  'bg-green/20 text-forest',
  OTHER:       'bg-gray-100 text-gray-500',
};

export default function ActionsList({ token }) {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    apiFetch('/actions/', token)
      .then(d => setActions(d.actions ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (err)     return <Err msg={err} />;

  return (
    <div>
      <div className="font-serif text-2xl text-forest mb-6">Actions <span className="text-green text-base font-normal">({actions.length})</span></div>
      {actions.length === 0 && <Empty text="No actions recorded" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-gray-300 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{ACTION_ICONS[a.action_type] ?? '📋'}</span>
              <span className="text-dark font-medium">{a.action_type}</span>
            </div>
            <div className="text-gray-400 text-xs mb-1">Block: <span className="text-dark">{a.block_name ?? a.block}</span></div>
            <div className="text-gray-400 text-xs mb-3">Period: <span className="text-forest font-medium">{a.period}</span></div>
            {a.chemical_type && a.chemical_type !== 'NONE' && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CHEM_BADGE[a.chemical_type] ?? 'bg-gray-100 text-gray-500'}`}>
                {a.chemical_type}
              </span>
            )}
            <div className="flex gap-3 text-xs text-gray-400 mt-2">
              {a.quantity  && <span>{a.quantity} L/kg</span>}
              {a.cost      && <span>€{a.cost}</span>}
            </div>
            {a.notes && <div className="text-gray-400 text-xs mt-2 line-clamp-2">{a.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() { return <div className="text-green text-sm py-8 text-center">Loading…</div>; }
function Err({ msg }) { return <div className="text-red-400 text-sm py-8 text-center">{msg}</div>; }
function Empty({ text }) { return <div className="text-gray-400 text-sm py-8 text-center">{text}</div>; }
