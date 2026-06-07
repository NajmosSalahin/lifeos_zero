import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Smile, Moon, Droplets, Wind, BookOpen, Target, BarChart3, Calendar, Settings, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { usePreferencesStore } from '../../stores/preferences.store';
import { cn } from '../../lib/utils';

const NAV = [
  { to:'/dashboard',  icon: LayoutDashboard, label:'dashboard' },
  { to:'/habits',     icon: CheckSquare,     label:'habits' },
  { to:'/mood',       icon: Smile,           label:'mood' },
  { to:'/sleep',      icon: Moon,            label:'sleep' },
  { to:'/hydration',  icon: Droplets,        label:'hydration' },
  { to:'/breathing',  icon: Wind,            label:'breathing' },
  { to:'/journal',    icon: BookOpen,        label:'journal' },
  { to:'/goals',      icon: Target,          label:'goals' },
  { to:'/analytics',  icon: BarChart3,       label:'analytics' },
  { to:'/calendar',   icon: Calendar,        label:'calendar' },
];

export const Sidebar = () => {
  const { sidebarCollapsed, sidebarWidth, theme } = usePreferencesStore(s => s.preferences);
  const { updatePreference } = usePreferencesStore();
  const w = sidebarCollapsed ? 60 : sidebarWidth;

  return (
    <aside className="fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 border-r"
      style={{ width: w, backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b shrink-0" style={{ borderColor:'var(--color-border)' }}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor:'var(--color-accent)' }}>
          <Zap className="h-4 w-4 text-white" />
        </div>
        {!sidebarCollapsed && <span className="font-bold text-lg" style={{ color:'var(--color-text-primary)' }}>lifeos</span>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors group',
            isActive
              ? 'text-white'
              : 'hover:bg-[var(--color-surface-2)]'
          )} style={({ isActive }) => isActive ? { backgroundColor:'var(--color-accent)', color:'#fff' } : { color:'var(--color-text-secondary)' }}>
            <Icon className="h-4 w-4 shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Settings + collapse */}
      <div className="border-t p-2 space-y-0.5" style={{ borderColor:'var(--color-border)' }}>
        <NavLink to="/settings" className={({ isActive }) => cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'text-white' : 'hover:bg-[var(--color-surface-2)]'
        )} style={({ isActive }) => isActive ? { backgroundColor:'var(--color-accent)' } : { color:'var(--color-text-secondary)' }}>
          <Settings className="h-4 w-4 shrink-0" />
          {!sidebarCollapsed && <span>settings</span>}
        </NavLink>
        <button onClick={() => updatePreference('sidebarCollapsed', !sidebarCollapsed)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-[var(--color-surface-2)]"
          style={{ color:'var(--color-text-muted)' }}>
          {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <><ChevronLeft className="h-4 w-4" /><span>collapse</span></>}
        </button>
      </div>
    </aside>
  );
};
