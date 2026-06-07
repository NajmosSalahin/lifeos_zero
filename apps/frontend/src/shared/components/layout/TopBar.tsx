import { useState } from 'react';
import { Bell, User, LogOut, Settings, UserCircle, CheckCheck, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth.store';
import { api } from '../../lib/axios';
import { qk } from '../../lib/queryKeys';
import { getInitials } from '../../lib/utils';

const timeAgo = (date: string) => {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const TopBar = () => {
  const user = useAuthStore(s => s.user);
  const clearAuth = useAuthStore(s => s.clearAuth);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: notifData } = useQuery({
    queryKey: qk.notifications.all(),
    queryFn: () => api.get('/notifications').then(r => r.data.data.notifications),
    enabled: notifOpen,
    staleTime: 30000,
  });

  const { data: countData } = useQuery({
    queryKey: qk.notifications.count(),
    queryFn: () => api.get('/notifications/unread-count').then(r => r.data.data.count),
    refetchInterval: 60000,
  });

  const markReadMut = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.notifications.all() });
      queryClient.invalidateQueries({ queryKey: qk.notifications.count() });
    },
  });

  const markAllReadMut = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.notifications.all() });
      queryClient.invalidateQueries({ queryKey: qk.notifications.count() });
    },
  });

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    clearAuth(); navigate('/login');
  };

  const unreadCount = countData ?? 0;
  const notifications = Array.isArray(notifData) ? notifData : [];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 md:px-6"
      style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
      <div />
      <div className="flex items-center gap-1.5">

        {/* Notification Bell Dropdown */}
        <DropdownMenu.Root open={notifOpen} onOpenChange={setNotifOpen}>
          <DropdownMenu.Trigger asChild>
            <button
              className="relative flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              style={{ color:'var(--color-text-secondary)' }}
              title="notifications">
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold leading-tight text-white"
                  style={{ backgroundColor:'var(--color-accent)' }}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-[320px] origin-top-right rounded-xl border p-0 shadow-xl animate-fade-in"
              style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              {/* Header */}
              <div className="flex items-center justify-between border-b px-4 py-3" style={{ borderColor:'var(--color-border)' }}>
                <span className="text-sm font-semibold" style={{ color:'var(--color-text-primary)' }}>notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllReadMut.mutate()}
                    className="flex items-center gap-1 text-xs font-medium transition-colors hover:opacity-80"
                    style={{ color:'var(--color-accent)' }}>
                    <CheckCheck className="h-3.5 w-3.5" />
                    mark all read
                  </button>
                )}
              </div>
              {/* Body */}
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.slice(0, 20).map(n => (
                    <DropdownMenu.Item
                      key={n._id}
                      onSelect={() => {
                        if (!n.isRead) markReadMut.mutate(n._id);
                        if (n.actionUrl) navigate(n.actionUrl);
                        setNotifOpen(false);
                      }}
                      className="flex cursor-pointer items-start gap-3 border-b px-4 py-3 text-left outline-none transition-colors last:border-b-0 hover:bg-[var(--color-surface-2)]"
                      style={{ borderColor:'var(--color-border)' }}>
                      <div className="mt-1 shrink-0">
                        {n.isRead ? (
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor:'var(--color-surface-3)' }} />
                        ) : (
                          <div className="h-2 w-2 rounded-full" style={{ backgroundColor:'var(--color-accent)' }} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-medium truncate" style={{ color:'var(--color-text-primary)' }}>{n.title}</p>
                          {n.actionUrl && <ExternalLink className="h-3 w-3 shrink-0" style={{ color:'var(--color-text-muted)' }} />}
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed line-clamp-2" style={{ color:'var(--color-text-secondary)' }}>{n.body}</p>
                        <p className="mt-1 text-[11px]" style={{ color:'var(--color-text-muted)' }}>{timeAgo(n.createdAt)}</p>
                      </div>
                    </DropdownMenu.Item>
                  ))
                ) : (
                  <div className="flex flex-col items-center gap-2 px-4 py-10">
                    <Bell className="h-8 w-8" style={{ color:'var(--color-text-muted)' }} />
                    <p className="text-sm font-medium" style={{ color:'var(--color-text-primary)' }}>no notifications yet</p>
                    <p className="text-xs" style={{ color:'var(--color-text-muted)' }}>notifications will appear here</p>
                  </div>
                )}
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Avatar Dropdown Menu */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
              style={{ backgroundColor:'var(--color-surface-2)', color:'var(--color-text-primary)' }}
              title={user ? `${user.firstName} ${user.lastName}` : 'profile'}>
              {user ? getInitials(user.firstName, user.lastName) : <User className="h-4 w-4" />}
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              align="end"
              sideOffset={8}
              className="z-50 min-w-[200px] origin-top-right rounded-xl border p-1 shadow-xl animate-fade-in"
              style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              {/* User Info */}
              {user && (
                <div className="px-3 py-2">
                  <p className="text-sm font-medium truncate" style={{ color:'var(--color-text-primary)' }}>{user.firstName} {user.lastName}</p>
                  <p className="text-xs truncate" style={{ color:'var(--color-text-muted)' }}>{user.email}</p>
                </div>
              )}
              <DropdownMenu.Separator className="mx-2 h-px" style={{ backgroundColor:'var(--color-border)' }} />
              <DropdownMenu.Item
                onSelect={() => navigate('/app/settings')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-[var(--color-surface-2)]"
                style={{ color:'var(--color-text-secondary)' }}>
                <UserCircle className="h-4 w-4" />
                profile
              </DropdownMenu.Item>
              <DropdownMenu.Item
                onSelect={() => navigate('/app/settings')}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-[var(--color-surface-2)]"
                style={{ color:'var(--color-text-secondary)' }}>
                <Settings className="h-4 w-4" />
                settings
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="mx-2 h-px" style={{ backgroundColor:'var(--color-border)' }} />
              <DropdownMenu.Item
                onSelect={handleLogout}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none transition-colors hover:bg-[var(--color-surface-2)]"
                style={{ color:'var(--color-text-muted)' }}>
                <LogOut className="h-4 w-4" />
                log out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

      </div>
    </header>
  );
};
