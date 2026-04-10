import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function FarmsList({ token }) {
  const [farms, setFarms]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    apiFetch('/farms/', token)
      .then(d => setFarms(d.farms ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (err)     return <Err msg={err} />;

  return (
    <div>
      <div className="font-serif text-2xl text-forest mb-6">Farms <span className="text-green text-base font-normal">({farms.length})</span></div>
      {farms.length === 0 && <Empty text="No farms found" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {farms.map(f => (
          <div key={f.id} className="bg-white rounded-xl border border-gray-300 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="text-dark font-medium text-base">{f.name}</div>
              {f.organic_certified && (
                <span className="text-xs bg-green/20 text-forest px-2 py-0.5 rounded-full font-medium">Organic</span>
              )}
            </div>
            <div className="flex gap-3 text-xs text-gray-400 mb-2">
              <span>🌱 {f.blocks_count ?? 0} blocks</span>
              {f.locations?.length > 0 && (
                <span>📍 {f.locations[0].latitude.toFixed(3)}, {f.locations[0].longitude.toFixed(3)}</span>
              )}
            </div>
            <div className="text-gray-300 text-xs font-mono">{f.id.slice(0, 8)}…</div>
            <div className="text-gray-400 text-xs mt-1">{new Date(f.created_at).toLocaleDateString()}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() { return <div className="text-green text-sm py-8 text-center">Loading…</div>; }
function Err({ msg }) { return <div className="text-red-400 text-sm py-8 text-center">{msg}</div>; }
function Empty({ text }) { return <div className="text-gray-400 text-sm py-8 text-center">{text}</div>; }
