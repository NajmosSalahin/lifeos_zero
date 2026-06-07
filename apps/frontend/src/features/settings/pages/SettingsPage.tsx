import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User, Palette, Shield, Trash2, Save, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../../shared/lib/axios';
import { useAuthStore } from '../../../shared/stores/auth.store';
import { useTheme } from '../../../shared/hooks/useTheme';
import { useToast } from '../../../shared/hooks/useToast';
import { THEMES } from '../../../constants/themes';
import { FONTS } from '../../../constants/fonts';
import { cn } from '../../../shared/lib/utils';

export default function SettingsPage() {
  const [tab, setTab] = useState<'profile'|'appearance'|'security'>('profile');
  const user = useAuthStore(s => s.user);
  const { updateUser, clearAuth } = useAuthStore();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Profile form
  const [profileForm, setProfileForm] = useState({ firstName: user?.firstName || '', lastName: user?.lastName || '', email: user?.email || '', timezone: user?.timezone || 'UTC' });

  // Security form
  const [secForm, setSecForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  // Theme
  const { theme, font, density, reducedMotion, setTheme, setFont, setDensity, updatePreference } = useTheme();

  const updateProfileMut = useMutation({
    mutationFn: (dto: any) => api.patch('/users/me', dto),
    onSuccess: (res) => { updateUser(res.data.data.user); success('Profile updated!'); },
    onError: (e: any) => error(e?.response?.data?.error?.message || 'Update failed'),
  });

  const changePwMut = useMutation({
    mutationFn: (dto: any) => api.post('/auth/change-password', dto),
    onSuccess: () => { success('Password changed. Please log in again.'); clearAuth(); navigate('/login'); },
    onError: (e: any) => error(e?.response?.data?.error?.message || 'Failed'),
  });

  const deleteAccountMut = useMutation({
    mutationFn: () => api.delete('/users/me'),
    onSuccess: () => { clearAuth(); navigate('/login'); },
  });

  const { data: sessions } = useQuery({
    queryKey: ['auth','sessions'],
    queryFn: () => api.get('/auth/sessions').then(r => r.data.data.sessions),
    enabled: tab === 'security',
  });

  const revokeSessionMut = useMutation({
    mutationFn: (id: string) => api.delete(`/auth/sessions/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['auth','sessions'] }); success('Session revoked'); },
  });

  const TABS = [
    { id: 'profile', label: 'profile', icon: User },
    { id: 'appearance', label: 'appearance', icon: Palette },
    { id: 'security', label: 'security', icon: Shield },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>settings</h1>
        <p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>manage your account and preferences</p>
      </div>

      <div className="flex gap-2 border-b pb-0" style={{ borderColor:'var(--color-border)' }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as any)}
            className={cn('flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 -mb-px transition-colors', tab===id ? 'border-[var(--color-accent)]' : 'border-transparent hover:border-[var(--color-border)]')}
            style={tab===id ? { color:'var(--color-accent)' } : { color:'var(--color-text-muted)' }}>
            <Icon className="h-4 w-4" />{label}
          </button>
        ))}
      </div>

      {/* ── PROFILE ──────────────────────────────────────────────── */}
      {tab === 'profile' && (
        <div className="space-y-5">
          <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>personal info</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {[['firstName','first name'],['lastName','last name']].map(([k,l]) => (
                  <div key={k}>
                    <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>{l}</label>
                    <input value={(profileForm as any)[k]} onChange={e => setProfileForm(f => ({...f,[k]:e.target.value}))}
                      className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                      style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>email</label>
                <input value={profileForm.email} disabled
                  className="w-full rounded-lg border px-3 py-2 text-sm opacity-60 cursor-not-allowed"
                  style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
              </div>
              <div>
                <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>timezone</label>
                <input value={profileForm.timezone} onChange={e => setProfileForm(f => ({...f,timezone:e.target.value}))}
                  className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                  style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
              </div>
            </div>
          </div>



          <button onClick={() => updateProfileMut.mutate(profileForm)} disabled={updateProfileMut.isPending}
            className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor:'var(--color-accent)' }}>
            <Save className="h-4 w-4" />{updateProfileMut.isPending ? 'saving…' : 'save changes'}
          </button>

          {/* Danger Zone */}
          <div className="rounded-xl border border-rose-500/30 p-5">
            <h2 className="font-semibold text-rose-400 mb-2">danger zone</h2>
            <p className="text-sm mb-4" style={{ color:'var(--color-text-muted)' }}>permanently delete your account and all data. this cannot be undone.</p>
            <button onClick={() => { if (confirm('delete your account? this is permanent and cannot be undone.')) deleteAccountMut.mutate(); }}
              className="flex items-center gap-2 rounded-lg border border-rose-500/50 px-4 py-2 text-sm font-medium text-rose-400 hover:bg-rose-500/10 transition-colors">
              <Trash2 className="h-4 w-4" /> delete account
            </button>
          </div>
        </div>
      )}

      {/* ── APPEARANCE ───────────────────────────────────────────── */}
      {tab === 'appearance' && (
        <div className="space-y-5">
          {/* Themes */}
          <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>theme</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {THEMES.map(t => (
                <button key={t.id} onClick={() => setTheme(t.id)}
                  className={cn('relative rounded-xl border-2 p-3 text-left transition-all hover:scale-105', theme===t.id ? 'border-[var(--color-accent)]' : 'border-transparent hover:border-[var(--color-border)]')}>
                  <div className="rounded-lg overflow-hidden mb-2 h-12 flex flex-col gap-0.5 p-1.5" style={{ backgroundColor: t.preview.bg }}>
                    <div className="h-2 rounded-sm w-3/4" style={{ backgroundColor: t.preview.text, opacity:0.7 }} />
                    <div className="h-1.5 rounded-sm w-1/2" style={{ backgroundColor: t.preview.text, opacity:0.4 }} />
                    <div className="h-1.5 rounded-sm w-2/3 mt-0.5" style={{ backgroundColor: t.preview.accent }} />
                  </div>
                  <p className="text-xs font-medium" style={{ color:'var(--color-text-primary)' }}>{t.label}</p>
                  {theme === t.id && <Check className="absolute top-2 right-2 h-3.5 w-3.5" style={{ color:'var(--color-accent)' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>font</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONTS.map(f => (
                <button key={f.id} onClick={() => setFont(f.id)}
                  className={cn('rounded-xl border-2 p-3 text-left transition-all', font===f.id ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-border-active)]')}
                  style={{ backgroundColor:'var(--color-surface-2)' }}>
                  <p className="text-sm font-medium" style={{ color:'var(--color-text-primary)', fontFamily: f.id === 'jetbrains-mono' || f.id === 'fira-code' ? 'monospace' : f.id === 'merriweather' ? 'serif' : 'sans-serif' }}>{f.label}</p>
                  <p className="text-xs mt-0.5 capitalize" style={{ color:'var(--color-text-muted)' }}>{f.type}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Density */}
          <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>density</h2>
            <div className="flex gap-3">
              {(['compact','comfortable','spacious'] as const).map(d => (
                <button key={d} onClick={() => setDensity(d)}
                  className={cn('flex-1 rounded-xl border-2 py-3 text-sm font-medium transition-all', density===d ? 'border-[var(--color-accent)] text-white' : 'border-[var(--color-border)] hover:border-[var(--color-border-active)]')}
                  style={density===d ? { backgroundColor:'var(--color-accent)' } : { backgroundColor:'var(--color-surface-2)', color:'var(--color-text-secondary)' }}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility */}
          <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>accessibility</h2>
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <p className="text-sm font-medium" style={{ color:'var(--color-text-primary)' }}>reduce motion</p>
                <p className="text-xs" style={{ color:'var(--color-text-muted)' }}>minimize animations and transitions</p>
              </div>
              <button onClick={() => updatePreference('reducedMotion', !reducedMotion)}
                className={cn('relative h-6 w-11 rounded-full transition-colors', reducedMotion ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-surface-3)]')}>
                <div className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform', reducedMotion ? 'translate-x-5' : 'translate-x-0.5')} />
              </button>
            </label>
          </div>
        </div>
      )}

      {/* ── SECURITY ─────────────────────────────────────────────── */}
      {tab === 'security' && (
        <div className="space-y-5">
          <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>change password</h2>
            <div className="space-y-3">
              {[['currentPassword','current password'],['newPassword','new password'],['confirmPassword','confirm new password']].map(([k,l]) => (
                <div key={k}>
                  <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>{l}</label>
                  <input type="password" value={(secForm as any)[k]} onChange={e => setSecForm(f => ({...f,[k]:e.target.value}))} placeholder="••••••••"
                    className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                    style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
                </div>
              ))}
            </div>
            <button onClick={() => {
              if (secForm.newPassword !== secForm.confirmPassword) { error('passwords do not match'); return; }
              changePwMut.mutate({ currentPassword: secForm.currentPassword, newPassword: secForm.newPassword });
            }} disabled={!secForm.currentPassword || !secForm.newPassword || changePwMut.isPending}
              className="mt-4 flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor:'var(--color-accent)' }}>
              <Shield className="h-4 w-4" />{changePwMut.isPending ? 'changing…' : 'change password'}
            </button>
          </div>

          <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold" style={{ color:'var(--color-text-primary)' }}>active sessions</h2>
              <button onClick={() => api.post('/auth/logout-all').then(() => { clearAuth(); navigate('/login'); })}
                className="text-xs text-rose-400 hover:text-rose-300 transition-colors">revoke all</button>
            </div>
            <div className="space-y-2">
              {sessions?.map((s: any) => (
                <div key={s._id} className="flex items-center justify-between rounded-lg p-3" style={{ backgroundColor:'var(--color-surface-2)' }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color:'var(--color-text-primary)' }}>{s.userAgent?.slice(0, 50) || 'unknown device'}</p>
                    <p className="text-xs" style={{ color:'var(--color-text-muted)' }}>{s.ipAddress} · {new Date(s.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => revokeSessionMut.mutate(s._id)} className="text-xs text-rose-400 hover:text-rose-300">revoke</button>
                </div>
              ))}
              {(!sessions || sessions.length === 0) && <p className="text-sm text-center py-3" style={{ color:'var(--color-text-muted)' }}>no active sessions</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
