import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Smile, BookOpen, Target } from 'lucide-react';
import { cn } from '../../lib/utils';

const NAV = [
  { to:'/dashboard', icon: LayoutDashboard, label:'home' },
  { to:'/habits',    icon: CheckSquare,     label:'habits' },
  { to:'/mood',      icon: Smile,           label:'mood' },
  { to:'/journal',   icon: BookOpen,        label:'journal' },
  { to:'/goals',     icon: Target,          label:'goals' },
];

export const MobileNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 z-40 flex h-16 border-t"
    style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
    {NAV.map(({ to, icon: Icon, label }) => (
      <NavLink key={to} to={to} className={({ isActive }) => cn('flex flex-1 flex-col items-center justify-center gap-0.5 text-xs transition-colors', isActive ? '' : '')}
        style={({ isActive }) => ({ color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)' })}>
        <Icon className="h-5 w-5" />
        <span>{label}</span>
      </NavLink>
    ))}
  </nav>
);
