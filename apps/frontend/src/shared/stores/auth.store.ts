import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

export interface AuthUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  preferences: any;
  hydrationGoal: number;
  sleepGoal: number;
  timezone: string;
  weight?: number | null;
  height?: number | null;
  activityLevel?: string;
}

interface S {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
}

interface A {
  setAuth: (user: AuthUser, token: string) => void;
  setAccessToken: (t: string) => void;
  updateUser: (p: Partial<AuthUser>) => void;
  clearAuth: () => void;
  setInitialized: () => void;
}

export const useAuthStore = create<S & A>()(immer(persist(
  (set) => ({
    user: null, accessToken: null, isAuthenticated: false, isInitialized: false,
    setAuth: (user, token) => set(s => { s.user = user; s.accessToken = token; s.isAuthenticated = true; s.isInitialized = true; }),
    setAccessToken: (token) => set(s => { s.accessToken = token; }),
    updateUser: (partial) => set(s => { if (s.user) Object.assign(s.user, partial); }),
    clearAuth: () => set(s => { s.user = null; s.accessToken = null; s.isAuthenticated = false; s.isInitialized = true; }),
    setInitialized: () => set(s => { s.isInitialized = true; }),
  }),
  {
    name: 'lifeos-auth',
    storage: createJSONStorage(() => sessionStorage),
    partialize: (s) => ({ user: s.user, accessToken: s.accessToken, isAuthenticated: s.isAuthenticated }),
  }
)));