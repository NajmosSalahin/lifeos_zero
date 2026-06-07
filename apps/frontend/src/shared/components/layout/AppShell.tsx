import { Suspense, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { PageLoader } from '../feedback/SkeletonCard';
import { usePreferencesStore } from '../../stores/preferences.store';
import { useIsMobile } from '../../hooks/useMediaQuery';

const PRELOAD = [
  () => import('../../../features/dashboard/pages/DashboardPage'),
  () => import('../../../features/habits/pages/HabitsPage'),
  () => import('../../../features/mood/pages/MoodPage'),
  () => import('../../../features/sleep/pages/SleepPage'),
  () => import('../../../features/hydration/pages/HydrationPage'),
  () => import('../../../features/breathing/pages/BreathingPage'),
  () => import('../../../features/journal/pages/JournalPage'),
  () => import('../../../features/goals/pages/GoalsPage'),
  () => import('../../../features/analytics/pages/AnalyticsPage'),
  () => import('../../../features/calendar/pages/CalendarPage'),
  () => import('../../../features/settings/pages/SettingsPage'),
];

export const AppShell = () => {
  const { sidebarCollapsed, sidebarWidth } = usePreferencesStore(s => s.preferences);
  const isMobile = useIsMobile();
  const ml = isMobile ? 0 : sidebarCollapsed ? 60 : sidebarWidth;

  useEffect(() => {
    const t = setTimeout(() => { PRELOAD.forEach(fn => fn().catch(() => {})); }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {!isMobile && <Sidebar />}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300" style={{ marginLeft: ml }}>
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            <Suspense fallback={<PageLoader />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
};
