import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const ALTITUDE_OPTIONS = [80, 100, 120, 140, 160, 200];

function AddFlightModal({ token, blocks, onClose, onAdded }) {
  const [blockId, setBlockId]   = useState('');
  const [date, setDate]         = useState('');
  const [altitude, setAltitude] = useState('');
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');

  const submit = async () => {
    if (!blockId || !date) { setErr('Block and date are required'); return; }
    setLoading(true); setErr('');
    try {
      await apiFetch('/flights/create/', token, {
        method: 'POST',
        body: JSON.stringify({ block_id: blockId, flight_date: date, altitude_meters: altitude ? parseInt(altitude) : null }),
      });
      onAdded();
      onClose();
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="font-serif text-xl text-forest mb-5">Add Flight</div>

        <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">Block</label>
        <select value={blockId} onChange={e => setBlockId(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest mb-4 text-dark">
          <option value="">Select block…</option>
          {blocks.map(b => <option key={b.id} value={b.id}>{b.name} — {b.farm_name}</option>)}
        </select>

        <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">Flight Date</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest mb-4" />

        <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">Altitude (meters)</label>
        <select value={altitude} onChange={e => setAltitude(e.target.value)}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest mb-6 text-dark">
          <option value="">Select altitude…</option>
          {ALTITUDE_OPTIONS.map(a => <option key={a} value={a}>{a}m</option>)}
        </select>

        {err && <div className="text-red-500 text-xs mb-4">{err}</div>}

        <div className="flex gap-3">
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2.5 bg-forest text-white rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-50 transition-opacity">
            {loading ? 'Saving…' : 'Save Flight'}
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

export default function FlightsList({ token }) {
  const [flights, setFlights]   = useState([]);
  const [blocks, setBlocks]     = useState([]);
  const [blockId, setBlockId]   = useState('');
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadFlights = () => {
    setLoading(true);
    const params = blockId ? `?block_id=${blockId}` : '';
    apiFetch(`/flights/${params}`, token)
      .then(d => setFlights(d.flights ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    apiFetch('/blocks/', token).then(d => setBlocks(d.blocks ?? [])).catch(() => {});
  }, [token]);

  useEffect(() => { loadFlights(); }, [token, blockId]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="font-serif text-2xl text-forest">Drone Flights <span className="text-green text-base font-normal">({flights.length})</span></div>
        <div className="flex gap-3">
          <select value={blockId} onChange={e => setBlockId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest text-dark">
            <option value="">All Blocks</option>
            {blocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-forest text-white rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
            + Add Flight
          </button>
        </div>
      </div>

      {loading && <Spinner />}
      {err     && <Err msg={err} />}
      {!loading && !err && flights.length === 0 && <Empty text="No flights recorded" />}

      {flights.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Flight ID</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Block</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Farm</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Date</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Altitude</th>
                <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Images</th>
              </tr>
            </thead>
            <tbody>
              {flights.map((f, i) => (
                <tr key={f.id} className={`hover:bg-gray-50 transition-colors ${i < flights.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <td className="px-5 py-3 text-gray-400 font-mono text-xs">{f.id.slice(0, 8)}…</td>
                  <td className="px-5 py-3 text-dark font-medium">{f.block_name}</td>
                  <td className="px-5 py-3 text-gray-400">{f.farm_name}</td>
                  <td className="px-5 py-3"><span className="bg-green/20 text-forest text-xs px-2 py-0.5 rounded-full font-medium">{f.flight_date}</span></td>
                  <td className="px-5 py-3">
                    {f.altitude_meters
                      ? <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full font-medium">{f.altitude_meters}m</span>
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-5 py-3 text-gray-400">{f.images_count ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AddFlightModal
          token={token}
          blocks={blocks}
          onClose={() => setShowModal(false)}
          onAdded={loadFlights}
        />
      )}
    </div>
  );
}

function Spinner() { return <div className="text-green text-sm py-8 text-center">Loading…</div>; }
function Err({ msg }) { return <div className="text-red-400 text-sm py-8 text-center">{msg}</div>; }
function Empty({ text }) { return <div className="text-gray-400 text-sm py-8 text-center">{text}</div>; }
