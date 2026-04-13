import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function BlocksList({ token }) {
  const [blocks, setBlocks]   = useState([]);
  const [farms, setFarms]     = useState([]);
  const [farmId, setFarmId]   = useState('');
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  // Load farms for filter dropdown
  useEffect(() => {
    apiFetch('/farms/', token).then(d => setFarms(d.farms ?? [])).catch(() => {});
  }, [token]);

  useEffect(() => {
    setLoading(true);
    const params = farmId ? `?farm_id=${farmId}` : '';
    apiFetch(`/blocks/${params}`, token)
      .then(d => setBlocks(d.blocks ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token, farmId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="font-serif text-2xl text-forest">Blocks <span className="text-green text-base font-normal">({blocks.length})</span></div>
        <select
          value={farmId}
          onChange={e => setFarmId(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest text-dark"
        >
          <option value="">All Farms</option>
          {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      {loading && <Spinner />}
      {err     && <Err msg={err} />}
      {!loading && !err && blocks.length === 0 && <Empty text="No blocks found" />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {blocks.map(b => (
          <div key={b.id} className="bg-white rounded-xl border border-gray-300 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="text-dark font-medium text-base">{b.name}</div>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-green/20 text-forest text-xs px-2 py-0.5 rounded-full font-medium">🍇 {b.variety}</span>
            </div>
            {b.other_language_name && (
              <div className="text-gray-400 text-xs mt-1">{b.other_language_name}</div>
            )}
            <div className="text-gray-400 text-xs mt-3">Farm: <span className="text-forest font-medium">{b.farm_name}</span></div>

            {/* Polygon coordinates */}
            {b.locations?.length > 0 && (
              <div className="mt-3">
                <div className="text-xs font-medium text-forest uppercase tracking-wide mb-1.5">
                  Boundary ({b.locations.length} point{b.locations.length > 1 ? 's' : ''})
                </div>
                <div className="bg-gray-50 rounded-lg p-2 space-y-1">
                  {b.locations.map((loc, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="w-5 h-5 bg-forest/10 text-forest rounded-full flex items-center justify-center font-medium text-[10px] shrink-0">{i + 1}</span>
                      <span className="font-mono">{Number(loc.latitude).toFixed(5)}, {Number(loc.longitude).toFixed(5)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() { return <div className="text-green text-sm py-8 text-center">Loading…</div>; }
function Err({ msg }) { return <div className="text-red-400 text-sm py-8 text-center">{msg}</div>; }
function Empty({ text }) { return <div className="text-gray-400 text-sm py-8 text-center">{text}</div>; }
