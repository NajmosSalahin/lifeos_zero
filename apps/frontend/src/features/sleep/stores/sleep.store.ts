import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export type SleepMode = 'wakeup-cycles' | 'bedtime-wakeup' | 'bedtime-cycles';

export interface SleepPrefs {
  mode: SleepMode;
  preferredWakeUp: string;
  preferredBedtime: string;
  preferredCycles: number;
}

const DEFAULTS: SleepPrefs = {
  mode: 'wakeup-cycles',
  preferredWakeUp: '07:00',
  preferredBedtime: '23:00',
  preferredCycles: 5,
};

interface S {
  prefs: SleepPrefs;
}

interface A {
  setMode: (mode: SleepMode) => void;
  setPreferredWakeUp: (t: string) => void;
  setPreferredBedtime: (t: string) => void;
  setPreferredCycles: (n: number) => void;
}

export const useSleepStore = create<S & A>()(
  immer(
    persist(
      (set) => ({
        prefs: DEFAULTS,
        setMode: (mode) => set(s => { s.prefs.mode = mode; }),
        setPreferredWakeUp: (t) => set(s => { s.prefs.preferredWakeUp = t; }),
        setPreferredBedtime: (t) => set(s => { s.prefs.preferredBedtime = t; }),
        setPreferredCycles: (n) => set(s => { s.prefs.preferredCycles = n; }),
      }),
      { name: 'lifeos-sleep', storage: createJSONStorage(() => localStorage) }
    )
  )
);
