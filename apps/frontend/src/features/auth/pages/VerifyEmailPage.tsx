import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Zap } from 'lucide-react';
import { api } from '../../../shared/lib/axios';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'loading'|'success'|'error'>('loading');
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  useEffect(() => {
    if (!token) { setStatus('error'); return; }
    api.post('/auth/verify-email', { token }).then(() => setStatus('success')).catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor:'var(--color-bg)' }}>
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor:'var(--color-accent)' }}><Zap className="h-6 w-6 text-white" /></div>
        </div>
        <div className="rounded-2xl border p-8" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          {status === 'loading' && <><Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[var(--color-accent)]" /><p style={{ color:'var(--color-text-secondary)' }}>verifying your email...</p></>}
          {status === 'success' && <><CheckCircle className="h-12 w-12 mx-auto mb-4 text-emerald-400" /><h1 className="text-xl font-bold mb-2" style={{ color:'var(--color-text-primary)' }}>email verified!</h1><p className="mb-4" style={{ color:'var(--color-text-muted)' }}>your account is now active.</p><Link to="/login" className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor:'var(--color-accent)' }}>sign in</Link></>}
          {status === 'error' && <><XCircle className="h-12 w-12 mx-auto mb-4 text-rose-400" /><h1 className="text-xl font-bold mb-2" style={{ color:'var(--color-text-primary)' }}>verification failed</h1><p className="mb-4" style={{ color:'var(--color-text-muted)' }}>the link is invalid or expired.</p><Link to="/login" className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor:'var(--color-accent)' }}>go to sign in</Link></>}
        </div>
      </div>
    </div>
  );
}
