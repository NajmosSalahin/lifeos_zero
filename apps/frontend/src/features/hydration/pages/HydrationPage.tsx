import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Droplets, Plus, Trash2, Settings, FlaskConical, Calculator, X, Check, Edit2 } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { ProgressRing } from '../../../shared/components/data-display/ProgressRing';
import { useToast } from '../../../shared/hooks/useToast';
import { useAuthStore } from '../../../shared/stores/auth.store';
import { formatTime, cn } from '../../../shared/lib/utils';

// ── Water factors per drink type ─────────────────────────────────
const WATER_FACTORS: Record<string, number> = {
  water: 1.0, coconut: 0.95, sports: 0.95, tea: 0.98,
  milk: 0.87, juice: 0.85, coffee: 0.85, smoothie: 0.88,
  soda: 0.85, energy: 0.80, other: 0.90,
};

const ACTIVITY_LEVELS = [
  { id: 'sedentary',  label: 'Sedentary',   desc: 'Little or no exercise',    factor: 1.2   },
  { id: 'light',      label: 'Light',        desc: 'Exercise 1–3 days/week',   factor: 1.375 },
  { id: 'moderate',   label: 'Moderate',     desc: 'Exercise 3–5 days/week',   factor: 1.55  },
  { id: 'active',     label: 'Active',       desc: 'Exercise 6–7 days/week',   factor: 1.725 },
  { id: 'very_active',label: 'Very Active',  desc: 'Twice daily training',     factor: 1.9   },
];

const DRINK_TYPES = [
  { id: 'water',   label: 'Water',        emoji: '💧', color: '#3b82f6' },
  { id: 'coffee',  label: 'Coffee',       emoji: '☕', color: '#92400e' },
  { id: 'tea',     label: 'Tea',          emoji: '🍵', color: '#d97706' },
  { id: 'juice',   label: 'Juice',        emoji: '🥤', color: '#f97316' },
  { id: 'milk',    label: 'Milk',         emoji: '🥛', color: '#e5e7eb' },
  { id: 'sports',  label: 'Sports',       emoji: '⚡', color: '#22c55e' },
  { id: 'soda',    label: 'Soda',         emoji: '🫧', color: '#a855f7' },
  { id: 'energy',  label: 'Energy',       emoji: '🔋', color: '#eab308' },
  { id: 'smoothie',label: 'Smoothie',     emoji: '🍹', color: '#ec4899' },
  { id: 'coconut', label: 'Coconut',      emoji: '🥥', color: '#84cc16' },
  { id: 'other',   label: 'Other',        emoji: '🫗', color: '#6b7280' },
];

const getEmoji = (drinkType: string, emoji?: string) => {
  if (emoji) return emoji;
  return DRINK_TYPES.find(d => d.id === drinkType)?.emoji ?? '💧';
};

// ── Custom Drink Form ─────────────────────────────────────────────
function DrinkTemplateForm({ template, onClose }: { template?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const { success, error } = useToast();
  const [form, setForm] = useState({
    name:        template?.name        ?? '',
    amountMl:    template?.amountMl    ?? 250,
    drinkType:   template?.drinkType   ?? 'water',
    emoji:       template?.emoji       ?? '💧',
    color:       template?.color       ?? '#3b82f6',
    waterFactor: template?.waterFactor ?? 1.0,
  });

  const saveMut = useMutation({
    mutationFn: (data: any) => template
      ? api.patch(`/drink-templates/${template._id}`, data)
      : api.post('/drink-templates', data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.hydration.templates() });
      success(template ? 'Template updated' : 'Drink template created');
      onClose();
    },
    onError: (e: any) => error(e?.response?.data?.error?.message || 'Failed'),
  });

  const selectedType = DRINK_TYPES.find(d => d.id === form.drinkType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
          {template ? 'Edit Drink' : 'New Drink Template'}
        </h2>
        <div className="space-y-3">
          {/* Name */}
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Morning Espresso"
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
              style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
          </div>

          {/* Drink type */}
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Drink Type</label>
            <div className="grid grid-cols-4 gap-1.5">
              {DRINK_TYPES.map(d => (
                <button key={d.id} onClick={() => setForm(f => ({ ...f, drinkType: d.id, emoji: d.emoji, waterFactor: WATER_FACTORS[d.id] ?? 1.0, color: d.color }))}
                  className={cn('flex flex-col items-center gap-0.5 rounded-lg py-2 text-xs transition-colors border-2',
                    form.drinkType === d.id ? 'border-[var(--color-accent)]' : 'border-transparent hover:bg-[var(--color-surface-2)]')}
                  style={{ backgroundColor: 'var(--color-surface-2)' }}>
                  <span className="text-lg">{d.emoji}</span>
                  <span style={{ color: 'var(--color-text-secondary)' }}>{d.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount + Water Factor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Amount (ml)</label>
              <input type="number" value={form.amountMl} onChange={e => setForm(f => ({ ...f, amountMl: Number(e.target.value) }))}
                min={1} max={5000}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
                Water Factor ({Math.round(form.waterFactor * 100)}%)
              </label>
              <input type="range" min={-0.5} max={1} step={0.01}
                value={form.waterFactor}
                onChange={e => setForm(f => ({ ...f, waterFactor: Number(e.target.value) }))}
                className="w-full mt-2 accent-[var(--color-accent)]" />
            </div>
          </div>

          {/* Water factor explanation */}
          <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
            {form.waterFactor >= 0
              ? `${form.amountMl}ml counts as ${Math.round(form.amountMl * form.waterFactor)}ml toward your hydration goal`
              : `⚠️ This drink is dehydrating — it removes ${Math.round(form.amountMl * Math.abs(form.waterFactor))}ml from your balance`}
          </p>

          {/* Custom emoji */}
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Custom Emoji</label>
            <input value={form.emoji} onChange={e => setForm(f => ({ ...f, emoji: e.target.value }))}
              maxLength={2} placeholder="💧"
              className="w-20 rounded-lg border px-3 py-2 text-xl text-center outline-none focus:border-[var(--color-accent)]"
              style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 rounded-lg border py-2 text-sm"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-secondary)' }}>Cancel</button>
          <button onClick={() => saveMut.mutate(form)} disabled={!form.name || saveMut.isPending}
            className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: 'var(--color-accent)' }}>
            {saveMut.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Smart Goal Calculator ─────────────────────────────────────────
function GoalCalculator({ onClose, onApply }: { onClose: () => void; onApply: (goal: number) => void }) {
  const user = useAuthStore(s => s.user);
  const [weight, setWeight] = useState(user?.weight ?? 70);
  const [height, setHeight] = useState(user?.height ?? 170);
  const [activity, setActivity] = useState((user as any)?.activityLevel ?? 'moderate');
  const [weather, setWeather] = useState<{ temp: number; humidity: number } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [calculated, setCalculated] = useState<number | null>(null);
  const { error } = useToast();

  const fetchWeather = async () => {
    setLoadingWeather(true);
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej)
      );
      const { latitude, longitude } = pos.coords;
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m`
      );
      const data = await res.json();
      setWeather({
        temp:     data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
      });
    } catch {
      error('Could not get location. Using average values (22°C, 50% humidity).');
      setWeather({ temp: 22, humidity: 50 });
    } finally {
      setLoadingWeather(false);
    }
  };

  const calculate = () => {
    const activityFactor = ACTIVITY_LEVELS.find(a => a.id === activity)?.factor ?? 1.55;
    const temp     = weather?.temp     ?? 22;
    const humidity = weather?.humidity ?? 50;
    const baseBody       = (weight * 35) + ((height - 150) * 5);
    const tempFactor     = 1 + (temp - 22) * 0.015;
    const humidityFactor = 1 + (humidity - 50) * 0.005;
    const goal = Math.max(Math.round(baseBody * activityFactor * tempFactor * humidityFactor), 1000);
    setCalculated(goal);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl border p-6"
        style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            Smart Goal Calculator
          </h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-muted)' }}><X className="h-4 w-4" /></button>
        </div>

        <div className="space-y-4">
          {/* Weight + Height */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} min={30} max={300}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Height (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} min={100} max={250}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Activity Level</label>
            <div className="space-y-1.5">
              {ACTIVITY_LEVELS.map(a => (
                <button key={a.id} onClick={() => setActivity(a.id)}
                  className={cn('w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors border',
                    activity === a.id ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:bg-[var(--color-surface-2)]')}
                  style={{ backgroundColor: activity === a.id ? 'var(--color-accent)10' : 'var(--color-surface-2)', color: 'var(--color-text-primary)' }}>
                  <span className="font-medium">{a.label}</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{a.desc}</span>
                  {activity === a.id && <Check className="h-4 w-4 shrink-0" style={{ color: 'var(--color-accent)' }} />}
                </button>
              ))}
            </div>
          </div>

          {/* Weather */}
          <div className="rounded-lg border p-3" style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                  {weather ? `🌡️ ${weather.temp}°C  💧 ${weather.humidity}% humidity` : 'Add weather data for accuracy'}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {weather ? 'Using your current local conditions' : 'Uses 22°C, 50% if skipped'}
                </p>
              </div>
              <button onClick={fetchWeather} disabled={loadingWeather}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: 'var(--color-accent)' }}>
                {loadingWeather ? '…' : weather ? 'Refresh' : 'Get Weather'}
              </button>
            </div>
          </div>

          {/* Result */}
          {calculated && (
            <div className="rounded-xl border-2 p-4 text-center" style={{ borderColor: 'var(--color-accent)', backgroundColor: 'var(--color-accent)10' }}>
              <p className="text-3xl font-bold" style={{ color: 'var(--color-accent)' }}>{calculated.toLocaleString()}ml</p>
              <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>Recommended daily intake</p>
            </div>
          )}
        </div>

        <div className="flex gap-2 mt-5">
          <button onClick={calculate}
            className="flex-1 rounded-lg py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: 'var(--color-accent)' }}>
            <Calculator className="h-4 w-4 inline mr-1.5" />Calculate
          </button>
          {calculated && (
            <button onClick={() => { onApply(calculated); onClose(); }}
              className="flex-1 rounded-lg py-2.5 text-sm font-medium border-2 font-semibold"
              style={{ borderColor: 'var(--color-accent)', color: 'var(--color-accent)' }}>
              Apply Goal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function HydrationPage() {
  const qc = useQueryClient();
  const { success, error } = useToast();

  const [tab, setTab] = useState<'today' | 'templates' | 'settings'>('today');
  const [showCustomMl, setShowCustomMl] = useState(false);
  const [customMl, setCustomMl] = useState('');
  const [customDrinkType, setCustomDrinkType] = useState('water');
  const [showTemplateForm, setShowTemplateForm] = useState(false);
  const [editTemplate, setEditTemplate] = useState<any>(null);
  const [showCalculator, setShowCalculator] = useState(false);

  const { data: today, isLoading } = useQuery({
    queryKey: qk.hydration.today(),
    queryFn: () => api.get('/hydration/today').then(r => r.data.data),
  });

  const { data: templates } = useQuery({
    queryKey: qk.hydration.templates(),
    queryFn: () => api.get('/drink-templates').then(r => r.data.data.templates),
  });

  const logMut = useMutation({
    mutationFn: (dto: any) => api.post('/hydration', dto),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hydration'] }); success('Logged!'); },
    onError: (e: any) => error(e?.response?.data?.error?.message || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/hydration/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['hydration'] }),
  });

  const deleteTemplateMut = useMutation({
    mutationFn: (id: string) => api.delete(`/drink-templates/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: qk.hydration.templates() }); success('Template deleted'); },
  });

  const updateGoalMut = useMutation({
    mutationFn: (goal: number) => api.patch('/users/me', { hydrationGoal: goal }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['hydration'] }); success('Goal updated!'); },
  });

  const logCustom = () => {
    const ml = Number(customMl);
    if (!ml || ml < 1) return;
    const waterFactor = WATER_FACTORS[customDrinkType] ?? 1.0;
    logMut.mutate({ amountMl: ml, drinkType: customDrinkType, waterFactor });
    setCustomMl('');
    setShowCustomMl(false);
  };

  const systemTemplates = templates?.filter((t: any) => t.isSystem) ?? [];
  const customTemplates = templates?.filter((t: any) => !t.isSystem) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Hydration</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>Track your daily fluid intake</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-0" style={{ borderColor: 'var(--color-border)' }}>
        {(['today', 'templates', 'settings'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn('pb-3 px-1 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',
              tab === t ? 'border-[var(--color-accent)]' : 'border-transparent hover:border-[var(--color-border)]')}
            style={tab === t ? { color: 'var(--color-accent)' } : { color: 'var(--color-text-muted)' }}>
            {t === 'today' ? '💧 Today' : t === 'templates' ? '🫙 Drinks' : '⚙️ Settings'}
          </button>
        ))}
      </div>

      {/* ── TODAY TAB ─────────────────────────────────────────── */}
      {tab === 'today' && (
        <div className="space-y-5">
          {/* Progress */}
          <div className="rounded-xl border p-6 flex items-center gap-6"
            style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <ProgressRing
              value={today?.percentage ?? 0}
              size={110} strokeWidth={9}
              label={`${today?.percentage ?? 0}%`}
              sublabel="of goal"
            />
            <div className="flex-1">
              <p className="text-3xl font-bold tabular-nums" style={{ color: 'var(--color-text-primary)' }}>
                {(today?.effective ?? 0).toLocaleString()}
                <span className="text-base font-normal ml-1" style={{ color: 'var(--color-text-muted)' }}>ml effective</span>
              </p>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {(today?.total ?? 0).toLocaleString()}ml consumed · {(today?.goal ?? 2500).toLocaleString()}ml goal
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {Math.max(0, (today?.goal ?? 2500) - (today?.effective ?? 0)).toLocaleString()}ml remaining
              </p>
              {/* Progress bar */}
              <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-2)' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, today?.percentage ?? 0)}%`, backgroundColor: 'var(--color-accent)' }} />
              </div>
            </div>
          </div>

          {/* Quick add from templates */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>QUICK ADD</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {systemTemplates.slice(0, 6).map((t: any) => (
                <button key={t._id}
                  onClick={() => logMut.mutate({ amountMl: t.amountMl, drinkType: t.drinkType, waterFactor: t.waterFactor, templateId: t._id })}
                  className="flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all hover:scale-105 hover:border-[var(--color-accent)]"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <span className="text-2xl">{getEmoji(t.drinkType, t.emoji)}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.amountMl}ml</span>
                  <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{t.name.split(' ')[0]}</span>
                </button>
              ))}
              {/* Custom amount button */}
              <button onClick={() => setShowCustomMl(!showCustomMl)}
                className="flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-all hover:scale-105 hover:border-[var(--color-accent)]"
                style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                <span className="text-2xl">✏️</span>
                <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>Custom</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>any ml</span>
              </button>
            </div>
          </div>

          {/* Custom ml input */}
          {showCustomMl && (
            <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
              <p className="text-sm font-medium mb-3" style={{ color: 'var(--color-text-primary)' }}>Custom Amount</p>
              <div className="flex gap-2 mb-3">
                {DRINK_TYPES.map(d => (
                  <button key={d.id} onClick={() => setCustomDrinkType(d.id)}
                    className={cn('rounded-lg px-2 py-1.5 text-sm transition-colors border', customDrinkType === d.id ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]')}
                    style={{ backgroundColor: 'var(--color-surface-2)' }} title={d.label}>
                    {d.emoji}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="number" value={customMl}
                  onChange={e => setCustomMl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && logCustom()}
                  placeholder="Enter ml…" min={1} max={5000}
                  className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                  style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }}
                  autoFocus
                />
                <button onClick={logCustom} disabled={!customMl || logMut.isPending}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                  style={{ backgroundColor: 'var(--color-accent)' }}>
                  Log
                </button>
              </div>
              {customMl && (
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  Counts as {Math.round(Number(customMl) * (WATER_FACTORS[customDrinkType] ?? 1.0))}ml effective hydration
                </p>
              )}
            </div>
          )}

          {/* Today's log */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>TODAY'S LOG</p>
            <div className="space-y-2">
              {today?.logs?.length === 0 && (
                <p className="text-center py-8 text-sm" style={{ color: 'var(--color-text-muted)' }}>No drinks logged yet today</p>
              )}
              {today?.logs?.map((l: any) => (
                <div key={l._id} className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:border-[var(--color-border-active)] transition-colors"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <span className="text-xl shrink-0">{getEmoji(l.drinkType)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{l.amountMl}ml</span>
                      {l.waterFactor !== 1.0 && (
                        <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
                          ≈{l.effectiveMl}ml effective
                        </span>
                      )}
                      <span className="text-xs capitalize" style={{ color: 'var(--color-text-muted)' }}>{l.drinkType}</span>
                    </div>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{formatTime(l.loggedAt)}</p>
                  </div>
                  <button onClick={() => deleteMut.mutate(l._id)}
                    className="shrink-0 rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] hover:text-rose-400 transition-colors"
                    style={{ color: 'var(--color-text-muted)' }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TEMPLATES TAB ─────────────────────────────────────── */}
      {tab === 'templates' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Manage your drink templates
            </p>
            <button onClick={() => { setEditTemplate(null); setShowTemplateForm(true); }}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: 'var(--color-accent)' }}>
              <Plus className="h-4 w-4" /> New Drink
            </button>
          </div>

          {/* System templates */}
          <div>
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>BUILT-IN DRINKS</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {systemTemplates.map((t: any) => (
                <div key={t._id} className="flex items-center gap-3 rounded-xl border px-4 py-3"
                  style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                  <span className="text-2xl shrink-0">{getEmoji(t.drinkType, t.emoji)}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {t.amountMl}ml · {Math.round(t.waterFactor * 100)}% hydration
                    </p>
                  </div>
                  <button onClick={() => logMut.mutate({ amountMl: t.amountMl, drinkType: t.drinkType, waterFactor: t.waterFactor, templateId: t._id })}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-white"
                    style={{ backgroundColor: 'var(--color-accent)' }}>
                    Log
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Custom templates */}
          {customTemplates.length > 0 && (
            <div>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--color-text-muted)' }}>MY CUSTOM DRINKS</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {customTemplates.map((t: any) => (
                  <div key={t._id} className="flex items-center gap-3 rounded-xl border px-4 py-3 hover:border-[var(--color-border-active)] transition-colors"
                    style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
                    <span className="text-2xl shrink-0">{getEmoji(t.drinkType, t.emoji)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{t.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {t.amountMl}ml · {Math.round(t.waterFactor * 100)}% hydration
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => logMut.mutate({ amountMl: t.amountMl, drinkType: t.drinkType, waterFactor: t.waterFactor, templateId: t._id })}
                        className="rounded-lg px-2 py-1.5 text-xs font-medium text-white"
                        style={{ backgroundColor: 'var(--color-accent)' }}>
                        Log
                      </button>
                      <button onClick={() => { setEditTemplate(t); setShowTemplateForm(true); }}
                        className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}>
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => { if (confirm('Delete this template?')) deleteTemplateMut.mutate(t._id); }}
                        className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] hover:text-rose-400 transition-colors"
                        style={{ color: 'var(--color-text-muted)' }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SETTINGS TAB ──────────────────────────────────────── */}
      {tab === 'settings' && (
        <div className="space-y-5">
          {/* Smart calculator */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Smart Goal Calculator</h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Calculates your optimal hydration based on body stats, activity level, temperature and humidity.
                </p>
              </div>
              <button onClick={() => setShowCalculator(true)}
                className="shrink-0 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white ml-4"
                style={{ backgroundColor: 'var(--color-accent)' }}>
                <Calculator className="h-4 w-4" /> Calculate
              </button>
            </div>
            <div className="rounded-lg p-3 text-xs" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}>
              Formula uses: weight × 35 + height adjustment × activity factor × temperature factor × humidity factor
            </div>
          </div>

          {/* Manual goal */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Manual Daily Goal</h2>
            <div className="flex gap-2">
              <input type="number"
                defaultValue={today?.goal ?? 2500}
                id="manual-goal"
                min={500} max={10000}
                className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ backgroundColor: 'var(--color-surface-2)', borderColor: 'var(--color-border)', color: 'var(--color-text-primary)' }} />
              <button onClick={() => {
                const input = document.getElementById('manual-goal') as HTMLInputElement;
                updateGoalMut.mutate(Number(input.value));
              }} className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--color-accent)' }}>
                Set Goal
              </button>
            </div>
          </div>

          {/* Water factor info */}
          <div className="rounded-xl border p-5" style={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)' }}>
            <h2 className="font-semibold mb-3" style={{ color: 'var(--color-text-primary)' }}>Water Factors Guide</h2>
            <div className="space-y-2">
              {DRINK_TYPES.map(d => (
                <div key={d.id} className="flex items-center justify-between py-1.5 border-b last:border-0"
                  style={{ borderColor: 'var(--color-border)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{d.emoji}</span>
                    <span className="text-sm" style={{ color: 'var(--color-text-primary)' }}>{d.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--color-surface-2)' }}>
                      <div className="h-full rounded-full" style={{ width: `${Math.max(0, (WATER_FACTORS[d.id] ?? 1) * 100)}%`, backgroundColor: d.color }} />
                    </div>
                    <span className="text-xs font-medium w-10 text-right" style={{ color: 'var(--color-text-secondary)' }}>
                      {Math.round((WATER_FACTORS[d.id] ?? 1) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showTemplateForm && (
        <DrinkTemplateForm
          template={editTemplate}
          onClose={() => { setShowTemplateForm(false); setEditTemplate(null); }}
        />
      )}

      {showCalculator && (
        <GoalCalculator
          onClose={() => setShowCalculator(false)}
          onApply={(goal) => updateGoalMut.mutate(goal)}
        />
      )}
    </div>
  );
}