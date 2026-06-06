import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { usePreferencesStore } from '../../stores/preferences.store';
import { useIsMobile } from '../../hooks/useMediaQuery';

export const AppShell = () => {
  const { sidebarCollapsed, sidebarWidth } = usePreferencesStore(s => s.preferences);
  const isMobile = useIsMobile();
  const ml = isMobile ? 0 : sidebarCollapsed ? 60 : sidebarWidth;

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      {!isMobile && <Sidebar />}
      <div className="flex flex-1 flex-col overflow-hidden transition-all duration-300" style={{ marginLeft: ml }}>
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            <Outlet />
          </div>
        </main>
      </div>
      {isMobile && <MobileNav />}
    </div>
  );
};
