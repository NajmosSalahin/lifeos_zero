import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Zap, Loader2 } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { useToast } from '../../../shared/hooks/useToast';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const token = params.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!token) { error('Invalid reset link'); return; } setLoading(true);
    try { await api.post('/auth/reset-password', { token, password }); success('Password reset! Please log in.'); navigate('/login'); }
    catch (err: any) { error(err?.response?.data?.error?.message || 'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor:'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor:'var(--color-accent)' }}><Zap className="h-6 w-6 text-white" /></div>
        </div>
        <div className="rounded-2xl border p-8" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color:'var(--color-text-primary)' }}>Reset password</h1>
          <p className="text-sm mb-6" style={{ color:'var(--color-text-muted)' }}>Enter your new password</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="New password (min 8 chars)" required minLength={8}
              className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
              style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor:'var(--color-accent)' }}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Reset password
            </button>
          </form>
          <div className="mt-5 text-center"><Link to="/login" className="text-sm hover:underline" style={{ color:'var(--color-text-muted)' }}>Back to sign in</Link></div>
        </div>
      </div>
    </div>
  );
}
