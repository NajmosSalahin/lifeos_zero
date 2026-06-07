import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

export interface Toast { id: string; type: 'success'|'error'|'warning'|'info'; title: string; description?: string; duration?: number; }
interface S { toasts: Toast[]; activeModal: string|null; isMobileSidebarOpen: boolean; }
interface A { addToast: (t: Toast) => void; removeToast: (id: string) => void; openModal: (n: string) => void; closeModal: () => void; setMobileSidebar: (v: boolean) => void; }
export const useUIStore = create<S & A>()(immer((set) => ({
  toasts: [], activeModal: null, isMobileSidebarOpen: false,
  addToast: (t) => set(s => { s.toasts.push(t); }),
  removeToast: (id) => set(s => { s.toasts = s.toasts.filter(t => t.id !== id); }),
  openModal: (n) => set(s => { s.activeModal=n; }),
  closeModal: () => set(s => { s.activeModal=null; }),
  setMobileSidebar: (v) => set(s => { s.isMobileSidebarOpen=v; }),
})));
