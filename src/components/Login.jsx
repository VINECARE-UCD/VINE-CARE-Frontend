import { useState } from 'react';
import { API_BASE } from '../api';

export default function Login({ onLogin }) {
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState('');

  const submit = async () => {
    setLoading(true); setErr('');
    try {
      const r = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Login failed');
      const token = d.data?.token;
      if (!token) throw new Error('No token received');
      sessionStorage.setItem('vc_pub_token', token);
      onLogin(token);
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark">
      <div className="bg-white rounded-2xl p-12 w-96 shadow-2xl">
        <div className="font-serif text-3xl font-bold text-forest mb-1">🍇 VineCare</div>
        <div className="text-sm text-forest/60 mb-8">Vineyard phenology dashboard</div>

        <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest mb-4"
        />

        <label className="block text-xs font-medium text-forest uppercase tracking-wide mb-1.5">Password</label>
        <input
          type="password"
          value={pass}
          onChange={e => setPass(e.target.value)}
          placeholder="••••••••"
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm outline-none focus:border-forest mb-6"
        />

        <button
          onClick={submit}
          disabled={loading || !email || !pass}
          className="w-full py-3 bg-forest text-white rounded-lg text-sm font-medium cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        {err && <div className="text-red-600 text-xs mt-3 text-center">{err}</div>}
      </div>
    </div>
  );
}
