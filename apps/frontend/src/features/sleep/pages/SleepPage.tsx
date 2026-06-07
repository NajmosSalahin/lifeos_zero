import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Moon, Plus, Trash2, Star, Clock, Sunrise, Settings } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { StatCard } from '../../../shared/components/data-display/StatCard';
import { useToast } from '../../../shared/hooks/useToast';
import { formatDate, formatMinutes, cn } from '../../../shared/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useSleepStore, type SleepMode } from '../stores/sleep.store';

const CYCLE_MINUTES = 90;
const FALL_ASLEEP_MINUTES = 15;

const CYCLE_PROMPTS: Record<string, { label: string; color: string; emoji: string }> = {
  '0.5': { label: 'Power nap — boosts alertness without grogginess', color: '#3b82f6', emoji: '💤' },
  '1':   { label: 'Short nap — includes one full light-to-REM cycle', color: '#22c55e', emoji: '💤' },
  '1.5': { label: 'Light nap — 1.5 cycles', color: '#22c55e', emoji: '💤' },
  '2':   { label: 'Extended nap — two cycles, useful for recovery', color: '#f59e0b', emoji: '💤' },
  '3':   { label: 'Too short — not sustainable long-term', color: '#ef4444', emoji: '⚠️' },
  '4':   { label: 'Minimum — risk of sleep debt over time', color: '#f59e0b', emoji: '⚠️' },
  '5':   { label: 'Optimal for most adults', color: '#22c55e', emoji: '⭐' },
  '6':   { label: 'Generous — great for recovery or active lifestyles', color: '#22c55e', emoji: '⭐' },
  '7':   { label: 'Long — ensure quality isnt compensating for deficiency', color: '#3b82f6', emoji: 'ℹ️' },
};

function timeToMinutes(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(m: number): string {
  const adj = ((m % 1440) + 1440) % 1440;
  const h = Math.floor(adj / 60);
  const min = adj % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

function calculateDurationMinutes(bedtime: string, wakeUp: string): number {
  let d = timeToMinutes(wakeUp) - timeToMinutes(bedtime);
  if (d < 0) d += 1440;
  return d;
}

function getCycleInfo(cycles: number) {
  const duration = cycles * CYCLE_MINUTES;
  const key = cycles % 1 === 0 ? String(cycles) : String(cycles);
  const prompt = CYCLE_PROMPTS[key] ?? { label: `${duration} min`, color: 'var(--color-text-muted)', emoji: '' };
  return { duration, hours: duration / 60, prompt };
}

function calculateFromWakeupCycles(wakeUp: string, cycles: number) {
  const wakeMins = timeToMinutes(wakeUp);
  const bedtimeMins = wakeMins - (cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES);
  const bedtime = minutesToTime(bedtimeMins);
  const { duration, hours, prompt } = getCycleInfo(cycles);
  return { bedtime, wakeUp, duration, hours, cycles, prompt };
}

function calculateFromBedtimeWakeup(bedtime: string, wakeUp: string) {
  const rawDuration = calculateDurationMinutes(bedtime, wakeUp);
  const rawCycles = (rawDuration - FALL_ASLEEP_MINUTES) / CYCLE_MINUTES;
  const snappedCycles = Math.max(1, Math.min(7, Math.round(rawCycles)));
  const snappedDuration = snappedCycles * CYCLE_MINUTES;
  const totalInBed = snappedDuration + FALL_ASLEEP_MINUTES;
  const snappedWakeMins = (timeToMinutes(bedtime) + totalInBed) % 1440;
  const snappedWakeUp = minutesToTime(snappedWakeMins);
  const { hours, prompt } = getCycleInfo(snappedCycles);
  return {
    bedtime,
    wakeUp: snappedWakeUp,
    duration: snappedDuration,
    hours,
    cycles: snappedCycles,
    prompt,
    rawCycles,
    needsSnap: rawCycles !== snappedCycles,
  };
}

function calculateFromBedtimeCycles(bedtime: string, cycles: number) {
  const bedtimeMins = timeToMinutes(bedtime);
  const wakeMins = bedtimeMins + cycles * CYCLE_MINUTES + FALL_ASLEEP_MINUTES;
  const wakeUp = minutesToTime(wakeMins);
  const { duration, hours, prompt } = getCycleInfo(cycles);
  return { bedtime, wakeUp, duration, hours, cycles, prompt };
}

// ── Log Sleep Form ────────────────────────────────────────────────
function LogSleepForm({ form, setForm, onSave, onCancel, isPending }: { form: any; setForm: any; onSave: () => void; onCancel: () => void; isPending: boolean }) {
  const cycleInfo = (() => {
    try {
      const rawDuration = calculateDurationMinutes(form.bedtime, form.wakeTime);
      const rawCycles = (rawDuration - FALL_ASLEEP_MINUTES) / CYCLE_MINUTES;
      const rounded = Math.round(rawCycles);
      const isExact = Math.abs(rawCycles - rounded) < 0.01;
      const below = Math.floor(rawCycles);
      const above = Math.ceil(rawCycles);
      const closest = isExact ? rounded : (Math.abs(rawCycles - below) <= Math.abs(rawCycles - above) ? below : above);
      return {
        duration: rawDuration,
        rawCycles,
        below: { cycles: below, diff: Math.abs(rawCycles - below) },
        above: { cycles: above, diff: Math.abs(rawCycles - above) },
        closest,
        isExact,
        hours: rawDuration / 60,
      };
    } catch { return null; }
  })();

  return (
    <div className="rounded-xl border p-5 animate-fade-in" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
      <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>log sleep</h2>

      {/* Date + Times */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>date</label>
          <input type="date" value={form.date} onChange={e => setForm((f: any) => ({...f, date: e.target.value}))}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)', colorScheme:'dark' }} />
        </div>
        <div>
          <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>bedtime</label>
          <input type="time" value={form.bedtime} onChange={e => setForm((f: any) => ({...f, bedtime: e.target.value}))}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)', colorScheme:'dark' }} />
        </div>
        <div>
          <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>wake time</label>
          <input type="time" value={form.wakeTime} onChange={e => setForm((f: any) => ({...f, wakeTime: e.target.value}))}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)', colorScheme:'dark' }} />
        </div>
      </div>

      {/* Cycle info */}
      {cycleInfo && cycleInfo.duration > 0 && (
        <div className="rounded-lg p-3 mb-4" style={{ backgroundColor:'var(--color-surface-2)' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color:'var(--color-text-muted)' }}>Sleep Cycles</span>
            <span className="text-sm font-bold tabular-nums" style={{ color:'var(--color-accent)' }}>
              ~{cycleInfo.rawCycles.toFixed(1)} cycles
            </span>
          </div>
          <div className="text-xs space-y-1">
            {cycleInfo.isExact ? (
              <div className="flex items-center gap-2 px-2 py-1 rounded" style={{ color:'#22c55e' }}>
                <span>✅</span>
                <span>matches a complete sleep cycle!</span>
              </div>
            ) : (
              <>
                {cycleInfo.below.cycles >= 1 && (
                  <div className={cn('flex items-center justify-between px-2 py-1 rounded', cycleInfo.closest === cycleInfo.below.cycles ? 'bg-[var(--color-accent)]15' : '')}>
                    <span style={{ color: cycleInfo.closest === cycleInfo.below.cycles ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                      △ Wake {minutesToTime(timeToMinutes(form.wakeTime) - (cycleInfo.rawCycles - cycleInfo.below.cycles) * CYCLE_MINUTES)} → {cycleInfo.below.cycles} cycles ({formatMinutes(cycleInfo.below.cycles * CYCLE_MINUTES)})
                    </span>
                    {cycleInfo.closest === cycleInfo.below.cycles && <span className="text-[10px] font-medium" style={{ color:'var(--color-accent)' }}>closest</span>}
                  </div>
                )}
                {cycleInfo.above.cycles <= 7 && (
                  <div className={cn('flex items-center justify-between px-2 py-1 rounded', cycleInfo.closest === cycleInfo.above.cycles ? 'bg-[var(--color-accent)]15' : '')}>
                    <span style={{ color: cycleInfo.closest === cycleInfo.above.cycles ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                      ▽ Wake {minutesToTime(timeToMinutes(form.wakeTime) + (cycleInfo.above.cycles - cycleInfo.rawCycles) * CYCLE_MINUTES)} → {cycleInfo.above.cycles} cycles ({formatMinutes(cycleInfo.above.cycles * CYCLE_MINUTES)})
                    </span>
                    {cycleInfo.closest === cycleInfo.above.cycles && <span className="text-[10px] font-medium" style={{ color:'var(--color-accent)' }}>closest</span>}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Quality */}
      <div className="mb-4">
        <label className="block text-xs mb-2" style={{ color:'var(--color-text-muted)' }}>quality</label>
        <div className="flex gap-1.5">
          {[1,2,3,4,5].map(q => (
            <button key={q} onClick={() => setForm((f: any) => ({...f, quality: q}))}
              className="p-1.5 rounded-lg transition-all hover:scale-110">
              <Star className="h-5 w-5" fill={q <= form.quality ? 'var(--color-accent)' : 'none'}
                stroke={q <= form.quality ? 'var(--color-accent)' : 'var(--color-border)'} />
            </button>
          ))}
        </div>
      </div>

      {/* Note */}
      <textarea value={form.note} onChange={e => setForm((f: any) => ({...f, note: e.target.value}))}
        placeholder="how was your sleep? (optional)" rows={2}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:border-[var(--color-accent)] mb-4"
        style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />

      {/* Actions */}
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 rounded-lg border py-2 text-sm transition-colors hover:bg-[var(--color-surface-2)]"
          style={{ borderColor:'var(--color-border)', color:'var(--color-text-secondary)' }}>cancel</button>
        <button onClick={onSave} disabled={!form.date || !form.bedtime || !form.wakeTime || isPending}
          className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50 transition-opacity"
          style={{ backgroundColor:'var(--color-accent)' }}>
          {isPending ? 'saving…' : 'save'}
        </button>
      </div>
    </div>
  );
}

export default function SleepPage() {
  const todayStr = new Date().toISOString().slice(0, 10);
  const [showLog, setShowLog] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [form, setForm] = useState({ date: todayStr, bedtime: '23:00', wakeTime: '07:00', quality: 4, note: '' });
  const qc = useQueryClient();
  const { success, error } = useToast();

  const sleepPrefs = useSleepStore();
  const [wakeUpInput, setWakeUpInput] = useState(sleepPrefs.prefs.preferredWakeUp);
  const [bedtimeInput, setBedtimeInput] = useState(sleepPrefs.prefs.preferredBedtime);
  const [cyclesInput, setCyclesInput] = useState(sleepPrefs.prefs.preferredCycles);
  const [mode, setMode] = useState<SleepMode>(sleepPrefs.prefs.mode);

  const { data, isLoading } = useQuery({ queryKey: qk.sleep.all(), queryFn: () => api.get('/sleep').then(r => r.data.data) });
  const { data: statsData } = useQuery({ queryKey: qk.sleep.stats(), queryFn: () => api.get('/sleep/stats').then(r => r.data.data.stats) });

  const logMut = useMutation({
    mutationFn: () => {
      const bedtimeISO = new Date(`${form.date}T${form.bedtime}:00`).toISOString();
      let wakeISO = new Date(`${form.date}T${form.wakeTime}:00`).toISOString();
      if (form.wakeTime <= form.bedtime) {
        const next = new Date(`${form.date}T${form.wakeTime}:00`);
        next.setDate(next.getDate() + 1);
        wakeISO = next.toISOString();
      }
      return api.post('/sleep', { ...form, bedtime: bedtimeISO, wakeTime: wakeISO });
    },
    onSuccess: () => { qc.invalidateQueries({queryKey:['sleep']}); success('Sleep logged!'); setShowLog(false); },
    onError: (e:any) => error(e?.response?.data?.error?.message||'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/sleep/${id}`),
    onSuccess: () => qc.invalidateQueries({queryKey:['sleep']}),
  });

  const result = useMemo(() => {
    try {
      switch (mode) {
        case 'wakeup-cycles':
          return { ...calculateFromWakeupCycles(wakeUpInput, cyclesInput), snapLabel: null };
        case 'bedtime-wakeup': {
          const r = calculateFromBedtimeWakeup(bedtimeInput, wakeUpInput);
          return {
            ...r,
            snapLabel: r.needsSnap
              ? `Your times give ~${r.rawCycles} cycles. To get exactly ${r.cycles} full cycles (${formatMinutes(r.duration)}), wake up at ${r.wakeUp} instead.`
              : null,
          };
        }
        case 'bedtime-cycles':
          return { ...calculateFromBedtimeCycles(bedtimeInput, cyclesInput), snapLabel: null };
      }
    } catch {
      return null;
    }
  }, [mode, wakeUpInput, bedtimeInput, cyclesInput]);

  const applyToSchedule = () => {
    if (!result) return;
    sleepPrefs.setMode(mode);
    sleepPrefs.setPreferredWakeUp(result.wakeUp);
    sleepPrefs.setPreferredBedtime(result.bedtime);
    sleepPrefs.setPreferredCycles(result.cycles);
    success('Sleep schedule saved!');
  };

  const items = data?.items ?? [];
  const chartData = items.slice(0,14).reverse().map((s:any) => ({
    date: new Date(s.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}),
    duration: Math.round((new Date(s.wakeTime).getTime()-new Date(s.bedtime).getTime())/3600000*10)/10,
  }));

  const MODE_OPTIONS: { id: SleepMode; label: string; desc: string }[] = [
    { id: 'wakeup-cycles',  label: 'Wake-up + Cycles',  desc: 'Set your wake-up time and desired cycles' },
    { id: 'bedtime-wakeup', label: 'Bedtime + Wake-up', desc: 'See how many cycles your current schedule gives' },
    { id: 'bedtime-cycles', label: 'Bedtime + Cycles',  desc: 'Set your bedtime and desired cycles' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>sleep</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>track your sleep patterns</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setShowCalculator(!showCalculator)}
            className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors border', showCalculator ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)]')}
            style={{ backgroundColor:'var(--color-surface-2)', color: showCalculator ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
            <Settings className="h-4 w-4" /> cycles
          </button>
          <button onClick={()=>setShowLog(!showLog)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor:'var(--color-accent)' }}>
            <Plus className="h-4 w-4" /> log sleep
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="avg duration" value={statsData ? formatMinutes(statsData.averageDuration) : '--'} icon={Moon} color="#8b5cf6" description="per night" />
        <StatCard title="avg quality" value={statsData?.averageQuality??'--'} unit="/5" icon={Star} color="#f59e0b" description="rating" />
        <StatCard title="total sessions" value={statsData?.totalSessions??'--'} description="logged" />
      </div>

      {/* ── Sleep Cycle Calculator Modal ───────────────────────── */}
      {showCalculator && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        onClick={e => e.target === e.currentTarget && setShowCalculator(false)}>
        <div className="w-full max-w-lg rounded-xl border p-5 max-h-[90vh] overflow-y-auto" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        <h2 className="font-semibold mb-1" style={{ color:'var(--color-text-primary)' }}>sleep cycle calculator</h2>
        <p className="text-xs mb-4" style={{ color:'var(--color-text-muted)' }}>
          each sleep cycle lasts ~90 minutes. the ideal bedtime ensures you wake up at the end of a full cycle.
        </p>

        {/* Mode selector */}
        <div className="flex gap-2 mb-5">
          {MODE_OPTIONS.map(m => (
            <button key={m.id} onClick={() => setMode(m.id)}
              className={cn('flex-1 rounded-xl border-2 px-3 py-2.5 text-left transition-all', mode === m.id ? 'border-[var(--color-accent)]' : 'border-[var(--color-border)] hover:border-[var(--color-border-active)]')}
              style={{ backgroundColor: mode === m.id ? 'var(--color-accent)10' : 'var(--color-surface-2)' }}>
              <p className="text-sm font-medium" style={{ color:'var(--color-text-primary)' }}>{m.label}</p>
              <p className="text-xs mt-0.5" style={{ color:'var(--color-text-muted)' }}>{m.desc}</p>
            </button>
          ))}
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          {(mode === 'wakeup-cycles' || mode === 'bedtime-wakeup') && (
            <div>
              <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>
                <Sunrise className="h-3 w-3 inline mr-1" />wake-up time
              </label>
              <input type="time" value={wakeUpInput} onChange={e => setWakeUpInput(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)', colorScheme:'dark' }} />
            </div>
          )}
          {(mode === 'bedtime-wakeup' || mode === 'bedtime-cycles') && (
            <div>
              <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>
                <Moon className="h-3 w-3 inline mr-1" />bedtime
              </label>
              <input type="time" value={bedtimeInput} onChange={e => setBedtimeInput(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)', colorScheme:'dark' }} />
            </div>
          )}
          {(mode === 'wakeup-cycles' || mode === 'bedtime-cycles') && (
            <div>
              <label className="block text-xs mb-1.5" style={{ color:'var(--color-text-muted)' }}>
                <Clock className="h-3 w-3 inline mr-1" />sleep cycles
              </label>
              <div className="flex gap-2 items-center">
                <input type="range" min={0.5} max={7} step={0.5} value={cyclesInput}
                  onChange={e => setCyclesInput(Number(e.target.value))}
                  className="flex-1 accent-[var(--color-accent)]" />
                <span className="text-sm font-medium w-10 text-right" style={{ color:'var(--color-text-primary)' }}>{cyclesInput}</span>
              </div>
              <div className="flex justify-between text-xs mt-0.5" style={{ color:'var(--color-text-muted)' }}>
                <span>0.5 (45m)</span><span>1 (1.5h)</span><span>2 (3h)</span><span>5 (7.5h)</span><span>7 (10.5h)</span>
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <div className="rounded-xl border-2 p-4" style={{ borderColor:'var(--color-accent)', backgroundColor:'var(--color-accent)08' }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center mb-3">
              {mode !== 'bedtime-wakeup' && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color:'var(--color-text-muted)' }}>bedtime</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color:'var(--color-accent)' }}>{result.bedtime}</p>
                </div>
              )}
              {mode !== 'bedtime-cycles' && (
                <div>
                  <p className="text-xs mb-0.5" style={{ color:'var(--color-text-muted)' }}>wake-up</p>
                  <p className="text-lg font-bold tabular-nums" style={{ color:'var(--color-accent)' }}>{result.wakeUp}</p>
                </div>
              )}
              <div>
                <p className="text-xs mb-0.5" style={{ color:'var(--color-text-muted)' }}>duration</p>
                <p className="text-lg font-bold tabular-nums" style={{ color:'var(--color-accent)' }}>{formatMinutes(result.duration)}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color:'var(--color-text-muted)' }}>cycles</p>
                <p className="text-lg font-bold tabular-nums" style={{ color:'var(--color-accent)' }}>{result.cycles}</p>
              </div>
            </div>

            {/* Cycle prompt */}
            <div className="rounded-lg px-3 py-2 text-xs flex items-center gap-2" style={{ backgroundColor:'var(--color-surface-2)' }}>
              <span>{result.prompt.emoji}</span>
              <span style={{ color: result.prompt.color }}>{result.prompt.label}</span>
              <span className="ml-auto text-xs" style={{ color:'var(--color-text-muted)' }}>
                {result.hours.toFixed(1)}h sleep
              </span>
            </div>

            {/* Snap label for mode 2 */}
            {(result as any).snapLabel && (
              <div className="mt-2 rounded-lg px-3 py-2 text-xs" style={{ backgroundColor:'var(--color-surface-2)', color:'var(--color-text-secondary)' }}>
                {(result as any).snapLabel}
              </div>
            )}

            <button onClick={applyToSchedule}
              className="mt-3 w-full rounded-lg py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor:'var(--color-accent)' }}>
              apply to schedule
            </button>
          </div>
        )}
        </div>
      </div>
      )}

      {/* ── Log Form Modal ────────────────────────────────────── */}
      {showLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={e => e.target === e.currentTarget && setShowLog(false)}>
          <LogSleepForm
            form={form}
            setForm={setForm}
            onSave={() => logMut.mutate()}
            onCancel={() => setShowLog(false)}
            isPending={logMut.isPending}
          />
        </div>
      )}

      {/* ── Chart ──────────────────────────────────────────────── */}
      {chartData.length > 1 && (
        <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>sleep duration (hours)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} barSize={20}>
              <XAxis dataKey="date" tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
              <YAxis domain={[0,12]} tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:8, fontSize:12 }} />
              <Bar dataKey="duration" fill="var(--color-accent)" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Log History ────────────────────────────────────────── */}
      <div className="space-y-2">
        {items.length === 0 && <EmptyState icon={Moon} title="no sleep logs yet" description="track your first night of sleep." />}
        {items.map((s: any) => {
          const dur = Math.round((new Date(s.wakeTime).getTime()-new Date(s.bedtime).getTime())/60000);
          return (
            <div key={s._id} className="flex items-center gap-4 rounded-xl border px-4 py-3 hover:border-[var(--color-border-active)] transition-colors"
              style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <Moon className="h-5 w-5 shrink-0 text-purple-400" />
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="font-medium text-sm" style={{ color:'var(--color-text-primary)' }}>{formatMinutes(dur)}</span>
                  <span className="text-sm" style={{ color:'var(--color-text-muted)' }}>{'⭐'.repeat(s.quality)}</span>
                </div>
                <p className="text-xs" style={{ color:'var(--color-text-muted)' }}>{formatDate(s.date)}</p>
              </div>
              <button onClick={()=>deleteMut.mutate(s._id)} className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] hover:text-rose-400 transition-colors" style={{ color:'var(--color-text-muted)' }}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
