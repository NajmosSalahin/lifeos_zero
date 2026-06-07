import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface Preferences { theme: string; font: string; fontSize: string; density: 'compact'|'comfortable'|'spacious'; sidebarCollapsed: boolean; sidebarWidth: number; reducedMotion: boolean; highContrast: boolean; readabilityMode: boolean; dashboardLayout: any[]; }
const DEFAULTS: Preferences = { theme:'dark', font:'inter', fontSize:'md', density:'comfortable', sidebarCollapsed:false, sidebarWidth:240, reducedMotion:false, highContrast:false, readabilityMode:false, dashboardLayout:[] };
interface S { preferences: Preferences; isSyncing: boolean; }
interface A { setPreferences: (p: Preferences) => void; updatePreference: <K extends keyof Preferences>(k: K, v: Preferences[K]) => void; setIsSyncing: (v: boolean) => void; }
export const usePreferencesStore = create<S & A>()(immer(persist(
  (set) => ({
    preferences: DEFAULTS, isSyncing: false,
    setPreferences: (p) => set(s => { s.preferences=p; }),
    updatePreference: (k, v) => set(s => { (s.preferences as any)[k]=v; }),
    setIsSyncing: (v) => set(s => { s.isSyncing=v; }),
  }),
  { name: 'lifeos-prefs', storage: createJSONStorage(() => localStorage) }
)));
