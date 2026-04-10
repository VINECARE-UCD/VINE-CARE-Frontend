export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8002/api';

export const authHeaders = (token) => ({
  'Content-Type': 'application/json',
  Authorization: `token ${token}`,
});

export async function apiFetch(path, token, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: authHeaders(token),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data.data ?? data;
}
