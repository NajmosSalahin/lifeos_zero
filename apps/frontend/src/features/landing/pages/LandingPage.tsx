import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../../shared/stores/auth.store';
import { Zap, CheckSquare, Smile, Moon, Droplets, Wind, BookOpen, Target, BarChart3, Calendar, ArrowRight, Menu, X, Shield, Sparkles, Download } from 'lucide-react';

const FEATURES = [
  { icon: CheckSquare, title: 'habits', desc: 'build daily routines with flexible frequencies, streak tracking, and completion logs.', color: '#6366f1' },
  { icon: Smile,       title: 'mood',   desc: 'track your emotional patterns with scores, tags, and insights that reveal trends.', color: '#f59e0b' },
  { icon: Moon,        title: 'sleep',  desc: 'optimize your rest with a cycle calculator, quality ratings, and duration charts.', color: '#8b5cf6' },
  { icon: Droplets,    title: 'hydration', desc: 'stay hydrated with auto-calculated goals based on your body, activity, and weather.', color: '#3b82f6' },
  { icon: Wind,        title: 'breathing', desc: 'guided exercises with animated visuals — reduce stress, one breath at a time.', color: '#06b6d4' },
  { icon: BookOpen,    title: 'journal', desc: 'write freely with a rich text editor, organize with tags, and search your thoughts.', color: '#ec4899' },
  { icon: Target,      title: 'goals',   desc: 'set meaningful targets, track progress with milestones, and celebrate achievements.', color: '#22c55e' },
  { icon: BarChart3,   title: 'analytics', desc: 'visualize everything — mood trends, sleep quality, hydration patterns, and more.', color: '#f97316' },
  { icon: Calendar,    title: 'calendar', desc: 'see your month at a glance with every habit, mood, and log mapped to your days.', color: '#14b8a6' },
];

const USPS = [
  { icon: Sparkles, title: 'all in one', desc: 'nine modules working together. your habits, mood, sleep, hydration, breathing, journal, goals, analytics, and calendar — one seamless experience.' },
  { icon: Shield,    title: 'guided by science', desc: 'sleep cycles, hydration formulas, breathing techniques — every tool is built on established methods, not guesswork.' },
  { icon: Download,  title: 'your data, your way', desc: 'export everything as JSON or CSV. customize with 11 themes, 6 fonts, and density controls. no lock-in, no surprises.' },
];

export default function LandingPage() {
  const { isAuthenticated, isInitialized } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isInitialized && isAuthenticated) navigate('/app/dashboard', { replace: true });
  }, [isInitialized, isAuthenticated, navigate]);

  if (!isInitialized || isAuthenticated) return null;

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-bg) 80%, transparent)', borderColor: 'var(--color-border)' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg" style={{ color: 'var(--color-text-primary)' }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-accent)' }}>
              <Zap className="h-4 w-4 text-white" />
            </div>
            lifeos
          </Link>
          <div className="flex items-center gap-3">
            <button onClick={() => scrollTo('features')} className="hidden sm:inline text-sm font-medium transition-colors hover:text-[var(--color-accent)]" style={{ color: 'var(--color-text-secondary)' }}>features</button>
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]" style={{ color: 'var(--color-text-secondary)' }}>log in</Link>
            <Link to="/signup" className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: 'var(--color-accent)' }}>
              sign up <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 pb-32 pt-24 text-center md:px-6 md:pt-32">
          <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
            <Sparkles className="h-3 w-3" style={{ color: 'var(--color-accent)' }} />
            your personal life operating system
          </div>
          <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl md:leading-tight">
            your life,{' '}
            <span className="bg-gradient-to-r from-[var(--color-accent)] to-purple-400 bg-clip-text text-transparent">
              systematically optimized
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg" style={{ color: 'var(--color-text-secondary)' }}>
            one app to track, analyze, and improve every aspect of your daily life.
            habits, mood, sleep, hydration, breathing, journal, goals, analytics, and calendar —
            all beautifully integrated.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/signup" className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-105" style={{ backgroundColor: 'var(--color-accent)' }}>
              get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <button onClick={() => scrollTo('features')} className="rounded-xl border px-6 py-3 text-sm font-medium transition-colors hover:bg-[var(--color-surface-2)]" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>
              explore features
            </button>
          </div>
        </div>
        {/* Subtle glow behind hero */}
        <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2" style={{ width: '600px', height: '400px', background: 'radial-gradient(ellipse, color-mix(in srgb, var(--color-accent) 15%, transparent) 0%, transparent 70%)' }} />
      </section>

      {/* Features Grid */}
      <section id="features" className="border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">everything you need</h2>
            <p className="mx-auto max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>nine integrated modules that work together to help you build a better life.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="group rounded-xl border p-5 transition-all hover:-translate-y-0.5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg transition-colors" style={{ backgroundColor: `${color}20` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="mb-1.5 font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* USPs */}
      <section className="border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-6 md:py-28">
          <div className="mb-14 text-center">
            <h2 className="mb-3 text-3xl font-bold md:text-4xl">why lifeos</h2>
            <p className="mx-auto max-w-xl" style={{ color: 'var(--color-text-secondary)' }}>built differently to fit your life, not the other way around.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {USPS.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--color-accent) 15%, var(--color-surface-2))' }}>
                  <Icon className="h-6 w-6" style={{ color: 'var(--color-accent)' }} />
                </div>
                <h3 className="mb-2 text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto max-w-3xl px-4 py-20 text-center md:px-6 md:py-28">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">ready to transform your life?</h2>
          <p className="mx-auto mb-10 max-w-lg" style={{ color: 'var(--color-text-secondary)' }}>
            join lifeos and start building better habits, one day at a time.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold text-white transition-all hover:scale-105" style={{ backgroundColor: 'var(--color-accent)' }}>
            create your account <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            already have one?{' '}
            <Link to="/login" className="font-medium underline-offset-2 hover:underline" style={{ color: 'var(--color-accent)' }}>sign in</Link>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 md:flex-row md:px-6">
          <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <div className="flex h-6 w-6 items-center justify-center rounded" style={{ backgroundColor: 'var(--color-accent)' }}>
              <Zap className="h-3 w-3 text-white" />
            </div>
            &copy; 2026 lifeos
          </div>
          <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
            <Link to="/login" className="transition-colors hover:text-[var(--color-accent)]">log in</Link>
            <Link to="/signup" className="transition-colors hover:text-[var(--color-accent)]">sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
