import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function BlocksList({ token }) {
  const [blocks, setBlocks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    apiFetch('/blocks/', token)
      .then(d => setBlocks(d.blocks ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (err)     return <Err msg={err} />;

  return (
    <div>
      <div className="font-serif text-2xl text-forest mb-6">Blocks <span className="text-green text-base font-normal">({blocks.length})</span></div>
      {blocks.length === 0 && <Empty text="No blocks found" />}
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
            {b.locations?.length > 0 && (
              <div className="text-gray-400 text-xs mt-1">
                📍 {b.locations[0].latitude.toFixed(4)}, {b.locations[0].longitude.toFixed(4)}
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
