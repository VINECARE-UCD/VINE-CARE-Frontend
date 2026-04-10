import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

export default function FlightsList({ token }) {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    apiFetch('/flights/', token)
      .then(d => setFlights(d.flights ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (err)     return <Err msg={err} />;

  return (
    <div>
      <div className="font-serif text-2xl text-forest mb-6">Drone Flights <span className="text-green text-base font-normal">({flights.length})</span></div>
      {flights.length === 0 && <Empty text="No flights recorded" />}
      <div className="bg-white rounded-xl border border-gray-300 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Flight ID</th>
              <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Block</th>
              <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Date</th>
              <th className="text-left text-xs font-medium text-forest uppercase tracking-wide px-5 py-3">Images</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((f, i) => (
              <tr key={f.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${i === flights.length - 1 ? 'border-none' : ''}`}>
                <td className="px-5 py-3 text-gray-400 font-mono text-xs">{f.id.slice(0, 8)}…</td>
                <td className="px-5 py-3 text-dark font-medium">{f.block_name ?? f.block}</td>
                <td className="px-5 py-3">
                  <span className="bg-green/20 text-forest text-xs px-2 py-0.5 rounded-full font-medium">{f.flight_date}</span>
                </td>
                <td className="px-5 py-3 text-gray-400">{f.images_count ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Spinner() { return <div className="text-green text-sm py-8 text-center">Loading…</div>; }
function Err({ msg }) { return <div className="text-red-400 text-sm py-8 text-center">{msg}</div>; }
function Empty({ text }) { return <div className="text-gray-400 text-sm py-8 text-center">{text}</div>; }
