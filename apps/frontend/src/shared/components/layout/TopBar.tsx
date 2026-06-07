import { Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';
import { useUIStore } from '../../stores/ui.store';
import { api } from '../../lib/axios';
import { getInitials } from '../../lib/utils';

export const TopBar = () => {
  const user = useAuthStore(s => s.user);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const addToast = useUIStore(s => s.addToast);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth(); navigate('/login');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6"
      style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
      <div />
      <div className="flex items-center gap-2">
        <button className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
          onClick={() => navigate('/settings')} style={{ color:'var(--color-text-secondary)' }}>
          <Bell className="h-4 w-4" />
        </button>
        <button onClick={() => navigate('/settings')}
          className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors hover:bg-[var(--color-surface-2)]"
          style={{ backgroundColor:'var(--color-surface-2)', color:'var(--color-text-primary)' }}
          title={user ? `${user.firstName} ${user.lastName}` : 'profile'}>
          {user ? getInitials(user.firstName, user.lastName) : <User className="h-4 w-4" />}
        </button>
        <button onClick={handleLogout}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-2)]"
          style={{ color:'var(--color-text-muted)' }} title="log out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};
