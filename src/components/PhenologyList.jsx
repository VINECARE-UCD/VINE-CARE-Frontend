import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const STAGE_COLORS = {
  'bud break':  'bg-green/20 text-forest',
  'flowering':  'bg-yellow-100 text-yellow-700',
  'fruit set':  'bg-orange-100 text-orange-600',
  'veraison':   'bg-purple-100 text-purple-700',
  'harvest':    'bg-red-100 text-red-600',
  'dormancy':   'bg-gray-100 text-gray-500',
};

function stageColor(name) {
  const lower = (name ?? '').toLowerCase();
  for (const [key, cls] of Object.entries(STAGE_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return 'bg-green/20 text-forest';
}

export default function PhenologyList({ token }) {
  const [stages, setStages]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    apiFetch('/phenology-stages/', token)
      .then(d => setStages(d.phenology_stages ?? d.stages ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (err)     return <Err msg={err} />;

  return (
    <div>
      <div className="font-serif text-2xl text-forest mb-6">Phenology Stages <span className="text-green text-base font-normal">({stages.length})</span></div>
      {stages.length === 0 && <Empty text="No phenology stages recorded" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stages.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-gray-300 shadow-sm p-5 hover:shadow-md transition-shadow">
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${stageColor(s.stage_name)}`}>
              {s.stage_name}
            </span>
            <div className="text-gray-400 text-xs mt-3">Block: <span className="text-dark font-medium">{s.block_name ?? s.block}</span></div>
            <div className="flex gap-3 text-xs text-gray-400 mt-2">
              <span>Start: <span className="text-forest font-medium">{s.start_date}</span></span>
              {s.end_date && <span>End: <span className="text-gray-500">{s.end_date}</span></span>}
            </div>
            {s.notes && <div className="text-gray-400 text-xs mt-2 line-clamp-2 leading-relaxed">{s.notes}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() { return <div className="text-green text-sm py-8 text-center">Loading…</div>; }
function Err({ msg }) { return <div className="text-red-400 text-sm py-8 text-center">{msg}</div>; }
function Empty({ text }) { return <div className="text-gray-400 text-sm py-8 text-center">{text}</div>; }
