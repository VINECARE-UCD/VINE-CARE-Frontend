import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiFetch } from '../api';

const METRICS = [
  { key: 'fungicide_reduction', label: 'Fungicide Reduction', unit: '%',   color: '#4B6646' },
  { key: 'fuel_reduction',      label: 'Fuel Reduction',      unit: '%',   color: '#6B9E8B' },
  { key: 'co2_reduction',       label: 'CO₂ Reduction',       unit: ' kg', color: '#2563EB' },
  { key: 'yield_reduction',     label: 'Yield Change',        unit: '%',   color: '#F59E0B' },
];

function BlockChart({ blockKpis, blockName }) {
  // Build chart data: one row per period, sorted
  const chartData = Object.values(
    blockKpis.reduce((acc, k) => {
      if (!acc[k.period]) acc[k.period] = { period: k.period };
      METRICS.forEach(m => { if (k[m.key] != null) acc[k.period][m.key] = k[m.key]; });
      return acc;
    }, {})
  ).sort((a, b) => a.period.localeCompare(b.period));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {METRICS.map(metric => {
        const hasData = chartData.some(d => d[metric.key] != null);
        return (
          <div key={metric.key} className="bg-white rounded-xl border border-gray-300 shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: metric.color }} />
                <span className="text-xs font-semibold text-dark">{metric.label}</span>
              </div>
              <span className="text-xs text-gray-400">{metric.unit.trim() || '%'}</span>
            </div>
            {!hasData ? (
              <div className="h-32 flex items-center justify-center text-gray-300 text-xs">No data</div>
            ) : (
              <ResponsiveContainer width="100%" height={130}>
                <LineChart data={chartData} margin={{ top: 4, right: 12, left: -24, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="period" tick={{ fontSize: 9, fill: '#9ca3af' }} />
                  <YAxis tick={{ fontSize: 9, fill: '#9ca3af' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 11 }}
                    formatter={v => [`${parseFloat(v).toFixed(1)}${metric.unit}`, metric.label]}
                  />
                  <Line type="monotone" dataKey={metric.key} stroke={metric.color} strokeWidth={2}
                    dot={{ r: 3, fill: metric.color }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        );
      })}
    </div>
  );
}

function AddKPIModal({ token, blocks, onClose, onAdded }) {
  const [form, setForm] = useState({
    block_id: '', period: '', fungicide_reduction: '', fuel_reduction: '',
    co2_reduction: '', yield_reduction: '',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.block_id || !form.period) { setErr('Block and period are required'); return; }
    setLoading(true); setErr('');
    try {
      await apiFetch('/kpis/create/', token, {
        method: 'POST',
        body: JSON.stringify({
          block_id:            form.block_id,
          period:              form.period,
          fungicide_reduction: form.fungicide_reduction !== '' ? parseFloat(form.fungicide_reduction) : null,
          fuel_reduction:      form.fuel_reduction      !== '' ? parseFloat(form.fuel_reduction)      : null,
          co2_reduction:       form.co2_reduction       !== '' ? parseFloat(form.co2_reduction)       : null,
          yield_reduction:     form.yield_reduction     !== '' ? parseFloat(form.yield_reduction)     : null,
        }),
      });
      onAdded(); onClose();
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="font-serif text-xl text-forest mb-5">Add KPI Record</div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">Block</label>
          <select value={form.block_id} onChange={e => set('block_id', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest text-dark">
            <option value="">Select block…</option>
            {blocks.map(b => <option key={b.id} value={b.id}>{b.name} — {b.farm_name}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">Period</label>
          <input type="text" placeholder="e.g. 2025-Q3" value={form.period}
            onChange={e => set('period', e.target.value)}
            className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest" />
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            ['Fungicide Reduction', 'fungicide_reduction', '%', '25'],
            ['Fuel Reduction',      'fuel_reduction',      '%', '18'],
            ['CO₂ Reduction',       'co2_reduction',       'kg', '90'],
            ['Yield Change',        'yield_reduction',     '%', '3.5'],
          ].map(([label, key, unit, ph]) => (
            <div key={key}>
              <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">
                {label} <span className="text-gray-400 normal-case font-normal">({unit})</span>
              </label>
              <input type="number" placeholder={ph} value={form[key]} onChange={e => set(key, e.target.value)}
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest" />
            </div>
          ))}
        </div>

        {err && <div className="text-red-500 text-xs mb-4">{err}</div>}

        <div className="flex gap-3">
          <button onClick={submit} disabled={loading}
            className="flex-1 py-2.5 bg-forest text-white rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-50 transition-opacity">
            {loading ? 'Saving…' : 'Save KPI'}
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

export default function KPIsList({ token }) {
  const [kpis, setKpis]           = useState([]);
  const [farms, setFarms]         = useState([]);
  const [blocks, setBlocks]       = useState([]);
  const [farmId, setFarmId]       = useState('');
  const [blockId, setBlockId]     = useState('');
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState('');
  const [showModal, setShowModal] = useState(false);

  const loadAll = () => {
    setLoading(true);
    Promise.all([
      apiFetch('/kpis/',   token).then(d => d.kpis   ?? []),
      apiFetch('/farms/',  token).then(d => d.farms  ?? []),
      apiFetch('/blocks/', token).then(d => d.blocks ?? []),
    ])
      .then(([k, f, b]) => { setKpis(k); setFarms(f); setBlocks(b); })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadAll(); }, [token]);

  if (loading) return <Spinner />;
  if (err)     return <Err msg={err} />;

  // Blocks visible in the block dropdown (filtered by selected farm)
  const visibleBlocks = farmId ? blocks.filter(b => b.farm_id === farmId) : blocks;
  const activeBlockId = visibleBlocks.find(b => b.id === blockId) ? blockId : '';

  // Filter KPIs by selection
  let filtered = kpis;
  if (activeBlockId) {
    filtered = kpis.filter(k => k.block_id === activeBlockId);
  } else if (farmId) {
    const ids = visibleBlocks.map(b => b.id);
    filtered = kpis.filter(k => ids.includes(k.block_id));
  }

  // Group: farm_name → block_name → [kpi records]
  const grouped = filtered.reduce((acc, k) => {
    const farm  = k.farm_name  ?? 'Unknown Farm';
    const block = k.block_name ?? 'Unknown Block';
    if (!acc[farm])        acc[farm] = {};
    if (!acc[farm][block]) acc[farm][block] = [];
    acc[farm][block].push(k);
    return acc;
  }, {});

  const farmEntries = Object.entries(grouped);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="font-serif text-2xl text-forest">KPIs</div>
        <div className="flex gap-2">
          <select value={farmId} onChange={e => { setFarmId(e.target.value); setBlockId(''); }}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest text-dark">
            <option value="">All Farms</option>
            {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <select value={activeBlockId} onChange={e => setBlockId(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest text-dark">
            <option value="">All Blocks</option>
            {visibleBlocks.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-forest text-white rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 transition-opacity">
            + Add KPI
          </button>
        </div>
      </div>

      {farmEntries.length === 0 && <Empty text="No KPI data for this selection" />}

      <div className="space-y-10">
        {farmEntries.map(([farmName, blockMap]) => (
          <div key={farmName}>
            {/* Farm header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="font-serif text-lg text-forest">🌿 {farmName}</div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-6 pl-4">
              {Object.entries(blockMap).map(([blockName, blockKpis]) => (
                <div key={blockName}>
                  {/* Block subheader */}
                  <div className="text-sm font-medium text-dark mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green inline-block" />
                    {blockName}
                    <span className="text-gray-400 font-normal">({blockKpis.length} period{blockKpis.length !== 1 ? 's' : ''})</span>
                  </div>
                  <BlockChart blockKpis={blockKpis} blockName={blockName} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <AddKPIModal
          token={token}
          blocks={blocks}
          onClose={() => setShowModal(false)}
          onAdded={loadAll}
        />
      )}
    </div>
  );
}

function Spinner() { return <div className="text-green text-sm py-8 text-center">Loading…</div>; }
function Err({ msg }) { return <div className="text-red-400 text-sm py-8 text-center">{msg}</div>; }
function Empty({ text }) { return <div className="text-gray-400 text-sm py-8 text-center">{text}</div>; }
