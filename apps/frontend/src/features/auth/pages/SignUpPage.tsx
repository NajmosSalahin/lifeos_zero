import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Zap, Loader2 } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { useAuthStore } from '../../../shared/stores/auth.store';
import { useToast } from '../../../shared/hooks/useToast';

const schema = z.object({ firstName: z.string().min(1).max(64), lastName: z.string().min(1).max(64), email: z.string().email(), password: z.string().min(8).regex(/[A-Z]/,'Needs uppercase').regex(/[0-9]/,'Needs number') });
type F = z.infer<typeof schema>;

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: F) => {
    setLoading(true);
    try {
      await api.post('/auth/register', data);
      success('Account created!', 'Check your email to verify your account.');
      const loginRes = await api.post('/auth/login', { email: data.email, password: data.password });
      setAuth(loginRes.data.data.user, loginRes.data.data.accessToken);
      navigate('/dashboard');
    } catch (e: any) { toastError(e?.response?.data?.error?.message || 'Registration failed'); }
    finally { setLoading(false); }
  };

  const Field = ({ name, label, type='text', placeholder }: { name: keyof F; label: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium mb-1.5" style={{ color:'var(--color-text-secondary)' }}>{label}</label>
      <input {...register(name)} type={type} placeholder={placeholder}
        className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
        style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
      {errors[name] && <p className="text-xs text-rose-400 mt-1">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor:'var(--color-bg)' }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ backgroundColor:'var(--color-accent)' }}>
            <Zap className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="rounded-2xl border p-8" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <h1 className="text-2xl font-bold mb-1" style={{ color:'var(--color-text-primary)' }}>Create account</h1>
          <p className="text-sm mb-6" style={{ color:'var(--color-text-muted)' }}>Start your personal life OS</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field name="firstName" label="First name" placeholder="John" />
              <Field name="lastName" label="Last name" placeholder="Doe" />
            </div>
            <Field name="email" label="Email" type="email" placeholder="you@example.com" />
            <Field name="password" label="Password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" />
            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor:'var(--color-accent)' }}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Create account
            </button>
          </form>
          <p className="text-center text-sm mt-5" style={{ color:'var(--color-text-muted)' }}>
            Already have an account? <Link to="/login" className="font-medium hover:underline" style={{ color:'var(--color-accent)' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
