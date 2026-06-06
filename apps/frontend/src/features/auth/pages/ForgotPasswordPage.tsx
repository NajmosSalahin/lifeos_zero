import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Loader2, ArrowLeft } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { useToast } from '../../../shared/hooks/useToast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { success, error } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/auth/forgot-password', { email }); setSent(true); success('Reset link sent!'); }
    catch (err: any) { error(err?.response?.data?.error?.message || 'Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor:'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor:'var(--color-accent)' }}>
            <Zap className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="rounded-2xl border p-8" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color:'var(--color-text-primary)' }}>Forgot password</h1>
          <p className="text-sm mb-6" style={{ color:'var(--color-text-muted)' }}>{sent ? 'Check your email for the reset link.' : "Enter your email and we'll send a reset link."}</p>
          {!sent && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor:'var(--color-accent)' }}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} Send reset link
              </button>
            </form>
          )}
          <div className="mt-5 flex justify-center">
            <Link to="/login" className="flex items-center gap-1.5 text-sm hover:underline" style={{ color:'var(--color-text-muted)' }}>
              <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
