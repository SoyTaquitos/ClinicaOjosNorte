import axios from 'axios';
import { clearTokens, getAccessToken, getRefreshToken } from './auth';

/**
 * Origen del backend en el navegador: `NEXT_PUBLIC_API_URL` en `.env` (p. ej. …/api).
 * Si está vacío, las peticiones van al mismo origen (`/api/...` → Route Handler de Next).
 */
export function browserApiOrigin(): string {
  if (typeof window === 'undefined') return '';
  let u = process.env.NEXT_PUBLIC_API_URL || '';
  if (!u) return '';
  u = u.replace(/\/$/, '');
  if (u.endsWith('/api')) u = u.slice(0, -4);
  return u;
}

const api = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const origin = browserApiOrigin();
  if (origin) {
    config.baseURL = origin;
  }
  const t = getAccessToken();
  if (t) {
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      clearTokens();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export async function logoutApi() {
  const refresh = getRefreshToken();
  if (refresh) {
    try {
      await api.post('/api/auth/logout/', { refresh });
    } catch {
      /* ignore */
    }
  }
  clearTokens();
}

export default api;
