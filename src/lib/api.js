import { auth } from '../firebase';
const origin = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
export async function apiFetch(path, options = {}) {
  await auth.authStateReady();
  if (!auth.currentUser) throw new Error('Please sign in to continue.');
  const token = await auth.currentUser.getIdToken();
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);
  const url = path.startsWith('/api/') ? `${origin}${path}` : path;
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || `Request failed (${response.status}). Please try again.`);
  }
  return response;
}
