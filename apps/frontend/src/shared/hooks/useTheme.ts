import { useEffect, useCallback } from 'react';
import { usePreferencesStore } from '../stores/preferences.store';
import { useAuthStore } from '../stores/auth.store';
import { api } from '../lib/axios';

export const useTheme = () => {
  const { preferences, updatePreference, setIsSyncing } = usePreferencesStore();
  const isAuth = useAuthStore(s => s.isAuthenticated);

  useEffect(() => { document.documentElement.setAttribute('data-theme', preferences.theme); }, [preferences.theme]);
  useEffect(() => { document.documentElement.setAttribute('data-font', preferences.font); }, [preferences.font]);
  useEffect(() => { document.documentElement.setAttribute('data-density', preferences.density); }, [preferences.density]);
  useEffect(() => { document.documentElement.style.setProperty('--color-accent', preferences.accentColor); }, [preferences.accentColor]);
  useEffect(() => { document.documentElement.setAttribute('data-motion', preferences.reducedMotion ? 'reduce' : 'normal'); }, [preferences.reducedMotion]);

  const sync = useCallback(async (updates: any) => {
    if (!isAuth) return;
    try { setIsSyncing(true); await api.patch('/users/me/preferences', updates); } catch {} finally { setIsSyncing(false); }
  }, [isAuth, setIsSyncing]);

  const setTheme = (theme: string) => { updatePreference('theme', theme); sync({ theme }); };
  const setFont = (font: string) => { updatePreference('font', font); sync({ font }); };
  const setDensity = (density: any) => { updatePreference('density', density); sync({ density }); };
  const setAccentColor = (accentColor: string) => { updatePreference('accentColor', accentColor); sync({ accentColor }); };

  return { ...preferences, setTheme, setFont, setDensity, setAccentColor, updatePreference };
};
