import { useCallback } from 'react';
import { usePreferencesStore } from '../stores/preferences.store';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../lib/axios';

export const useTheme = () => {
  const { preferences, updatePreference, setIsSyncing } = usePreferencesStore();
  const isAuth = useAuthStore(s => s.isAuthenticated);

  const sync = useCallback(async (updates: any) => {
    if (!isAuth) return;
    try { setIsSyncing(true); await api.patch('/users/me/preferences', updates); } catch {} finally { setIsSyncing(false); }
  }, [isAuth, setIsSyncing]);

  const setTheme = (theme: string) => { updatePreference('theme', theme); sync({ theme }); };
  const setFont = (font: string) => { updatePreference('font', font); sync({ font }); };
  const setDensity = (density: any) => { updatePreference('density', density); sync({ density }); };
  return { ...preferences, setTheme, setFont, setDensity, updatePreference };
};
