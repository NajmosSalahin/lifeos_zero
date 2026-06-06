import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Eye, EyeOff, Loader2 } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { useAuthStore } from '../../../shared/stores/auth.store';
import { useToast } from '../../../shared/hooks/useToast';

const schema = z.object({ email: z.string().email(), password: z.string().min(1), rememberMe: z.boolean().optional() });
type F = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      setAuth(res.data.data.user, res.data.data.accessToken);
      navigate(from, { replace: true });
    } catch (e: any) {
      toastError(e?.response?.data?.error?.message || 'Login failed');
    } finally { setLoading(false); }
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
          <h1 className="text-2xl font-bold mb-1" style={{ color:'var(--color-text-primary)' }}>Welcome back</h1>
          <p className="text-sm mb-6" style={{ color:'var(--color-text-muted)' }}>Sign in to your LifeOS account</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--color-text-secondary)' }}>Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" autoComplete="email"
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)]"
                style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--color-text-secondary)' }}>Password</label>
              <div className="relative">
                <input {...register('password')} type={showPw?'text':'password'} placeholder="••••••••" autoComplete="current-password"
                  className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors focus:border-[var(--color-accent)] pr-10"
                  style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:'var(--color-text-muted)' }}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color:'var(--color-text-secondary)' }}>
                <input {...register('rememberMe')} type="checkbox" className="rounded" />Remember me
              </label>
              <Link to="/forgot-password" className="text-sm hover:underline" style={{ color:'var(--color-accent)' }}>Forgot password?</Link>
            </div>
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor:'var(--color-accent)' }}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
            </button>
          </form>
          <p className="text-center text-sm mt-5" style={{ color:'var(--color-text-muted)' }}>
            No account? <Link to="/signup" className="font-medium hover:underline" style={{ color:'var(--color-accent)' }}>Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
