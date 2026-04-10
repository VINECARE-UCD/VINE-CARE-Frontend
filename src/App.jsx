import { useState } from 'react';
import Login           from './components/Login';
import Toast           from './components/Toast';
import FarmsList       from './components/FarmsList';
import BlocksList      from './components/BlocksList';
import FlightsList     from './components/FlightsList';
import PhenologyList   from './components/PhenologyList';
import KPIsList        from './components/KPIsList';
import ActionsList     from './components/ActionsList';
import PredictionsList from './components/PredictionsList';
import './index.css';

const TABS = [
  { id: 'farms',       label: 'Farms',       icon: '🌿' },
  { id: 'blocks',      label: 'Blocks',      icon: '🍇' },
  { id: 'flights',     label: 'Flights',     icon: '🚁' },
  { id: 'phenology',   label: 'Phenology',   icon: '🌱' },
  { id: 'kpis',        label: 'KPIs',        icon: '📊' },
  { id: 'actions',     label: 'Actions',     icon: '⚡' },
  { id: 'predictions', label: 'Predictions', icon: '🤖' },
];

export default function App() {
  const [token, setToken] = useState(() => sessionStorage.getItem('vc_pub_token'));
  const [tab, setTab]     = useState('farms');
  const [toast, setToast] = useState('');

  const logout = () => {
    sessionStorage.removeItem('vc_pub_token');
    setToken(null);
  };

  if (!token) return <Login onLogin={(t) => { setToken(t); setTab('farms'); }} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header — matches web-vine-care exactly */}
      <header className="bg-dark text-white flex items-center justify-between px-8 h-14 sticky top-0 z-40">
        <div className="font-serif text-xl text-green">🌿 VineCare</div>
        <nav className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer border-none transition-colors
                ${tab === t.id
                  ? 'bg-green/20 text-green'
                  : 'bg-transparent text-green/60 hover:text-green hover:bg-green/10'
                }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
          <button
            onClick={logout}
            className="px-4 py-1.5 rounded-lg text-sm cursor-pointer border-none bg-transparent text-orange-300 hover:bg-orange-400/10 transition-colors"
          >
            Sign out
          </button>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {tab === 'farms'       && <FarmsList       token={token} />}
        {tab === 'blocks'      && <BlocksList      token={token} />}
        {tab === 'flights'     && <FlightsList     token={token} />}
        {tab === 'phenology'   && <PhenologyList   token={token} />}
        {tab === 'kpis'        && <KPIsList        token={token} />}
        {tab === 'actions'     && <ActionsList     token={token} />}
        {tab === 'predictions' && <PredictionsList token={token} />}
      </main>

      {toast && <Toast msg={toast} onDone={() => setToast('')} />}
    </div>
  );
}
