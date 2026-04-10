import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

function KpiStat({ label, value, unit }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="text-center p-3 bg-gray-50 rounded-lg">
      <div className="text-forest text-lg font-semibold">
        {parseFloat(value).toFixed(1)}<span className="text-xs text-gray-400 ml-0.5">{unit}</span>
      </div>
      <div className="text-gray-400 text-xs mt-0.5">{label}</div>
    </div>
  );
}

export default function KPIsList({ token }) {
  const [kpis, setKpis]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    apiFetch('/kpis/', token)
      .then(d => setKpis(d.kpis ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (err)     return <Err msg={err} />;

  return (
    <div>
      <div className="font-serif text-2xl text-forest mb-6">KPIs <span className="text-green text-base font-normal">({kpis.length})</span></div>
      {kpis.length === 0 && <Empty text="No KPIs recorded" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {kpis.map(k => (
          <div key={k.id} className="bg-white rounded-xl border border-gray-300 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-dark font-medium">{k.block_name ?? k.block}</div>
                <div className="text-gray-400 text-xs mt-0.5">Period: <span className="text-forest font-medium">{k.period}</span></div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <KpiStat label="Fungicide Reduction" value={k.fungicide_reduction} unit="%" />
              <KpiStat label="Fuel Reduction"       value={k.fuel_reduction}      unit="%" />
              <KpiStat label="CO₂ Reduction"        value={k.co2_reduction}       unit="kg" />
              <KpiStat label="Yield Change"         value={k.yield_reduction}     unit="%" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Spinner() { return <div className="text-green text-sm py-8 text-center">Loading…</div>; }
function Err({ msg }) { return <div className="text-red-400 text-sm py-8 text-center">{msg}</div>; }
function Empty({ text }) { return <div className="text-gray-400 text-sm py-8 text-center">{text}</div>; }
