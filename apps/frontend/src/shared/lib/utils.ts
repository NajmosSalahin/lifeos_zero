import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
export const formatMinutes = (minutes: number) => { const h = Math.floor(minutes/60); const m = minutes%60; return h===0?`${m}m`:m===0?`${h}h`:`${h}h ${m}m`; };
export const formatDate = (d: string|Date) => new Date(d).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
export const formatTime = (d: string|Date) => new Date(d).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
export const getInitials = (f: string, l: string) => `${f[0]||''}${l[0]||''}`.toUpperCase();
export const truncate = (s: string, n: number) => s.length>n?s.slice(0,n)+'…':s;
