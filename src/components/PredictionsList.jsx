import { useState, useEffect } from 'react';
import { apiFetch } from '../api';

function ConfidenceBadge({ score }) {
  if (!score) return null;
  const val = parseFloat(score);
  const color = val >= 75 ? 'text-forest' : val >= 50 ? 'text-yellow-600' : 'text-red-500';
  return <span className={`text-2xl font-bold ${color}`}>{val.toFixed(0)}%</span>;
}

export default function PredictionsList({ token }) {
  const [preds, setPreds]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState('');

  useEffect(() => {
    apiFetch('/predictions/', token)
      .then(d => setPreds(d.predictions ?? []))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Spinner />;
  if (err)     return <Err msg={err} />;

  return (
    <div>
      <div className="font-serif text-2xl text-forest mb-6">AI Predictions <span className="text-green text-base font-normal">({preds.length})</span></div>
      {preds.length === 0 && <Empty text="No predictions available" />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {preds.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-300 shadow-sm p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="text-dark font-medium">{p.block_name ?? p.block}</div>
                <div className="text-gray-400 text-xs mt-0.5">{new Date(p.created_at).toLocaleDateString()}</div>
              </div>
              <ConfidenceBadge score={p.confidence_score} />
            </div>

            {p.result && (
              <div className="bg-green/20 text-forest text-xs px-3 py-1.5 rounded-lg mb-2 font-medium">{p.result}</div>
            )}

            {p.suggestion && (
              <div className="text-gray-500 text-xs leading-relaxed mb-3">{p.suggestion}</div>
            )}

            {p.yield_prediction && (
              <div className="text-xs text-gray-400">
                Predicted yield: <span className="text-forest font-medium">{parseFloat(p.yield_prediction).toFixed(2)} t/ha</span>
              </div>
            )}

            {Object.keys(p.stress_parameters ?? {}).length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {Object.entries(p.stress_parameters).map(([k, v]) => (
                  <span key={k} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                    {k}: {typeof v === 'number' ? v.toFixed(1) : v}
                  </span>
                ))}
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
