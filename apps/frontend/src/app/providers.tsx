import { type FC, type ReactNode, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './queryClient';
import { usePreferencesStore } from '../shared/stores/preferences.store';
import { useAuthStore } from '../shared/stores/auth.store';
import { api } from '../shared/lib/axios';
import { THEMES } from '../constants/themes';

const AppInit: FC = () => {
  const prefs = usePreferencesStore(s => s.preferences);
  const setPreferences = usePreferencesStore(s => s.setPreferences);
  const { setAuth, setInitialized, isAuthenticated } = useAuthStore();

  // Apply theme tokens on every pref change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', prefs.theme);
    document.documentElement.setAttribute('data-font', prefs.font);
    document.documentElement.setAttribute('data-density', prefs.density);
    document.documentElement.setAttribute('data-motion', prefs.reducedMotion ? 'reduce' : 'normal');
  }, [prefs]);

  // Sync server preferences after login
  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/users/me/preferences')
      .then(r => { if (r.data?.data?.preferences) setPreferences(r.data.data.preferences); })
      .catch(() => {});
  }, [isAuthenticated]);

  // On mount: attempt silent token refresh to restore session
useEffect(() => {
  api.post('/auth/refresh', {})
    .then(async refreshRes => {
      const accessToken: string = refreshRes.data.data.accessToken;
      const userRes = await api.get('/users/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      setAuth(userRes.data.data.user, accessToken);
    })
    .catch(() => {
      // No session — just mark as initialized so router can show login
      setInitialized();
    });
}, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

export const Providers: FC<{ children: ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <AppInit />
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </BrowserRouter>
);
