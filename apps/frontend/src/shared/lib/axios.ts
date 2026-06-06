import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

let isRefreshing = false;
let failedQueue: Array<{ resolve: (t: string) => void; reject: (e: any) => void }> = [];
const processQueue = (err: any, token: string|null = null) => { failedQueue.forEach(p => err ? p.reject(err) : p.resolve(token!)); failedQueue = []; };

const getStoredToken = () => { try { const s = JSON.parse(sessionStorage.getItem('lifeos-auth')||'{}'); return s?.state?.accessToken||null; } catch { return null; } };
const setStoredToken = (t: string) => { try { const s = JSON.parse(sessionStorage.getItem('lifeos-auth')||'{}'); if(s?.state){s.state.accessToken=t;sessionStorage.setItem('lifeos-auth',JSON.stringify(s));} } catch {} };

export const api = axios.create({ baseURL: '/api/v1', withCredentials: true, headers: {'Content-Type':'application/json'}, timeout: 15000 });

api.interceptors.request.use((c: InternalAxiosRequestConfig) => { const t = getStoredToken(); if(t) c.headers.Authorization=`Bearer ${t}`; return c; });

api.interceptors.response.use(
  r => r,
  async (error: AxiosError) => {
    const orig = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Don't retry refresh endpoint — prevents infinite loop
    if (orig.url?.includes('/auth/refresh')) return Promise.reject(error);
    
    if (error.response?.status !== 401 || orig._retry) return Promise.reject(error);
    // ... rest of interceptor
  orig._retry = true; isRefreshing = true;
  try {
    const { data } = await axios.post('/api/v1/auth/refresh', {}, { withCredentials: true });
    const tok: string = data.data.accessToken;
    setStoredToken(tok); processQueue(null, tok);
    orig.headers.Authorization = `Bearer ${tok}`; return api(orig);
  } catch (e) { processQueue(e, null); sessionStorage.removeItem('lifeos-auth'); window.location.href='/login'; return Promise.reject(e); }
  finally { isRefreshing = false; }
});
