import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

const TODAY = new Date();
TODAY.setHours(0, 0, 0, 0);

const MONTH_NAME = TODAY.toLocaleString('default', { month: 'long', year: 'numeric' });

function isActive(stage) {
  const start = new Date(stage.start_date);
  const end   = stage.end_date ? new Date(stage.end_date) : null;
  if (end) return start <= TODAY && TODAY <= end;
  return start <= TODAY;
}

const STAGE_COLORS = {
  'bud break':  { badge: 'bg-green/20 text-forest',         dot: 'bg-forest' },
  'flowering':  { badge: 'bg-yellow-100 text-yellow-700',   dot: 'bg-yellow-400' },
  'fruit set':  { badge: 'bg-orange-100 text-orange-600',   dot: 'bg-orange-400' },
  'veraison':   { badge: 'bg-purple-100 text-purple-700',   dot: 'bg-purple-400' },
  'harvest':    { badge: 'bg-red-100 text-red-600',         dot: 'bg-red-400' },
  'dormancy':   { badge: 'bg-gray-100 text-gray-500',       dot: 'bg-gray-400' },
};

function stageStyle(name) {
  const lower = (name ?? '').toLowerCase();
  for (const [key, cls] of Object.entries(STAGE_COLORS)) {
    if (lower.includes(key)) return cls;
  }
  return { badge: 'bg-green/20 text-forest', dot: 'bg-forest' };
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
  if (stages.length === 0) return <Empty text="No phenology stages recorded" />;

  // Group: farm → block → stages
  const grouped = stages.reduce((acc, s) => {
    const farm  = s.farm_name  ?? 'Unknown Farm';
    const block = s.block_name ?? s.block;
    if (!acc[farm])        acc[farm] = {};
    if (!acc[farm][block]) acc[farm][block] = [];
    acc[farm][block].push(s);
    return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="font-serif text-2xl text-forest">Phenology Stages</div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-forest inline-block"></span>
          Active in <span className="font-medium text-forest ml-1">{MONTH_NAME}</span>
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([farmName, blocks]) => (
          <div key={farmName}>
            {/* Farm header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="font-serif text-lg text-forest">🌿 {farmName}</div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="space-y-4 pl-4">
              {Object.entries(blocks).map(([blockName, blockStages]) => (
                <div key={blockName}>
                  {/* Block subheader */}
                  <div className="text-sm font-medium text-dark mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green inline-block"></span>
                    {blockName}
                    <span className="text-gray-400 font-normal">({blockStages.length} stage{blockStages.length > 1 ? 's' : ''})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {blockStages.map(s => {
                      const active = isActive(s);
                      const style  = stageStyle(s.stage_name);
                      return (
                        <div key={s.id} className={`rounded-xl border p-4 transition-all ${
                          active
                            ? 'border-forest bg-forest/5 shadow-md ring-2 ring-forest/20'
                            : 'border-gray-300 bg-white shadow-sm hover:shadow-md'
                        }`}>
                          {/* Active banner */}
                          {active && (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-forest mb-2">
                              <span className="w-2 h-2 rounded-full bg-forest animate-pulse inline-block"></span>
                              Active now · {MONTH_NAME}
                            </div>
                          )}

                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${style.badge}`}>
                            {s.stage_name}
                          </span>

                          <div className="flex gap-3 text-xs text-gray-400 mt-3">
                            <span>Start: <span className="text-forest font-medium">{s.start_date}</span></span>
                            {s.end_date && <span>End: <span className="text-gray-500">{s.end_date}</span></span>}
                          </div>

                          {!s.end_date && (
                            <div className="text-xs text-gray-400 mt-1">End: <span className="text-gray-300">ongoing</span></div>
                          )}

                          {s.notes && (
                            <div className="text-gray-400 text-xs mt-2 leading-relaxed line-clamp-2">{s.notes}</div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
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
