import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Download } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { StatCard } from '../../../shared/components/data-display/StatCard';
import { cn } from '../../../shared/lib/utils';

const RANGES = [{ label:'7 days', days:7 },{ label:'30 days', days:30 },{ label:'90 days', days:90 }];

export default function AnalyticsPage() {
  const [range, setRange] = useState(30);
  const [tab, setTab] = useState<'overview'|'mood'|'sleep'|'hydration'|'goals'>('overview');

  const to = new Date().toISOString().slice(0,10);
  const from = new Date(Date.now() - range*86400000).toISOString().slice(0,10);
  const r = `from=${from}&to=${to}`;

  const { data: overview } = useQuery({ queryKey: qk.analytics.overview(r), queryFn: () => api.get(`/analytics/overview?${r}`).then(d=>d.data.data), enabled: tab==='overview' });
  const { data: moodData } = useQuery({ queryKey: qk.analytics.mood(r), queryFn: () => api.get(`/analytics/mood?${r}`).then(d=>d.data.data), enabled: tab==='mood' });
  const { data: sleepData } = useQuery({ queryKey: qk.analytics.sleep(r), queryFn: () => api.get(`/analytics/sleep?${r}`).then(d=>d.data.data), enabled: tab==='sleep' });
  const { data: hydrationData } = useQuery({ queryKey: qk.analytics.hydration(r), queryFn: () => api.get(`/analytics/hydration?${r}`).then(d=>d.data.data), enabled: tab==='hydration' });
  const { data: goalsData } = useQuery({ queryKey: qk.analytics.goals(), queryFn: () => api.get('/analytics/goals').then(d=>d.data.data.goals), enabled: tab==='goals' });

  const CHART_STYLE = { backgroundColor:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:8, fontSize:12 };

  const exportCSV = async (module: string) => {
    const res = await api.get(`/exports/csv/${module}?${r}`, { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href=url; a.download=`${module}-export.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const exportJSON = async () => {
    const res = await api.get('/exports/json', { responseType: 'blob' });
    const url = URL.createObjectURL(res.data);
    const a = document.createElement('a'); a.href=url; a.download='lifeos-backup.json'; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div><h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>analytics</h1><p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>your health & habit data visualised</p></div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border overflow-hidden" style={{ borderColor:'var(--color-border)' }}>
            {RANGES.map(({label,days})=>(
              <button key={days} onClick={()=>setRange(days)} className={cn('px-3 py-1.5 text-xs font-medium transition-colors',range===days?'text-white':'hover:bg-[var(--color-surface-2)]')}
                style={range===days?{backgroundColor:'var(--color-accent)'}:{backgroundColor:'var(--color-surface)',color:'var(--color-text-secondary)'}}>{label}</button>
            ))}
          </div>
          <button onClick={exportJSON} className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors hover:bg-[var(--color-surface-2)]" style={{ borderColor:'var(--color-border)', color:'var(--color-text-secondary)' }}>
            <Download className="h-3.5 w-3.5" /> export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-0" style={{ borderColor:'var(--color-border)' }}>
        {['overview','mood','sleep','hydration','goals'].map(t=>(
          <button key={t} onClick={()=>setTab(t as any)} className={cn('pb-2 px-1 text-sm font-medium capitalize border-b-2 -mb-px transition-colors',tab===t?'border-[var(--color-accent)]':'border-transparent hover:border-[var(--color-border)]')}
            style={tab===t?{color:'var(--color-accent)'}:{color:'var(--color-text-muted)'}}>{t}</button>
        ))}
      </div>

      {tab==='overview' && overview && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="avg mood" value={overview.mood?.average??'--'} unit="/10" color="#f59e0b" />
            <StatCard title="avg sleep" value={overview.sleep?.averageDuration ? `${Math.round(overview.sleep.averageDuration/60)}h ${overview.sleep.averageDuration%60}m` : '--'} color="#8b5cf6" />
            <StatCard title="hydration" value={`${overview.hydration?.goalMetRate??0}%`} description="goal met rate" color="#3b82f6" />
            <StatCard title="habit rate" value={`${overview.habits?.byDay?.length ? Math.round(overview.habits.byDay.reduce((s:number,d:any)=>s+d.rate,0)/overview.habits.byDay.length) : 0}%`} description="completion rate" color="#22c55e" />
          </div>
          {overview.mood?.scores?.length > 1 && (
            <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>mood over time</h2>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={overview.mood.scores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[1,10]} tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Line type="monotone" dataKey="value" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab==='mood' && moodData && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="average score" value={moodData.average??'--'} unit="/10" color="#f59e0b" />
            <StatCard title="total entries" value={moodData.totalEntries??0} color="#6366f1" />
          </div>
          {moodData.scores?.length > 1 && (
            <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold" style={{ color:'var(--color-text-primary)' }}>mood trend</h2>
                <button onClick={()=>exportCSV('mood')} className="flex items-center gap-1 text-xs" style={{ color:'var(--color-text-muted)' }}><Download className="h-3 w-3" />csv</button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={moodData.scores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis domain={[1,10]} tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
          {moodData.distribution && (
            <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>score distribution</h2>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={moodData.distribution}>
                  <XAxis dataKey="score" tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Bar dataKey="count" fill="var(--color-accent)" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab==='sleep' && sleepData && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="avg duration" value={sleepData.averageDuration ? `${Math.floor(sleepData.averageDuration/60)}h ${sleepData.averageDuration%60}m` : '--'} color="#8b5cf6" />
            <StatCard title="avg quality" value={sleepData.averageQuality??'--'} unit="/5" color="#f59e0b" />
          </div>
          {sleepData.durations?.length > 0 && (
            <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <div className="flex justify-between mb-4">
                <h2 className="font-semibold" style={{ color:'var(--color-text-primary)' }}>sleep duration</h2>
                <button onClick={()=>exportCSV('sleep')} className="flex items-center gap-1 text-xs" style={{ color:'var(--color-text-muted)' }}><Download className="h-3 w-3" />csv</button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sleepData.durations.map((d:any)=>({...d,hours:Math.round(d.value/60*10)/10}))}>
                  <XAxis dataKey="date" tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Bar dataKey="hours" fill="#8b5cf6" radius={[4,4,0,0]} name="Hours" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab==='hydration' && hydrationData && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <StatCard title="daily average" value={`${Math.round(hydrationData.average/100)/10}L`} color="#3b82f6" />
            <StatCard title="goal met rate" value={`${hydrationData.goalMetRate??0}%`} color="#22c55e" />
          </div>
          {hydrationData.intake?.length > 0 && (
            <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <div className="flex justify-between mb-4">
                <h2 className="font-semibold" style={{ color:'var(--color-text-primary)' }}>daily intake vs goal</h2>
                <button onClick={()=>exportCSV('hydration')} className="flex items-center gap-1 text-xs" style={{ color:'var(--color-text-muted)' }}><Download className="h-3 w-3" />csv</button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={hydrationData.intake}>
                  <XAxis dataKey="date" tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4,4,0,0]} name="ml" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {tab==='goals' && (
        <div className="space-y-3">
          {goalsData?.map((g: any) => (
            <div key={g.id} className="rounded-xl border p-4" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-sm" style={{ color:'var(--color-text-primary)' }}>{g.title}</span>
                <span className="text-sm font-bold" style={{ color:'var(--color-accent)' }}>{g.progress}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor:'var(--color-surface-2)' }}>
                <div className="h-full rounded-full" style={{ width:`${g.progress}%`, backgroundColor:'var(--color-accent)' }} />
              </div>
              <p className="text-xs mt-1 capitalize" style={{ color:'var(--color-text-muted)' }}>{g.status} · {g.category}</p>
            </div>
          ))}
          {(!goalsData || goalsData.length === 0) && <p className="text-center py-12 text-sm" style={{ color:'var(--color-text-muted)' }}>no goals data</p>}
        </div>
      )}
    </div>
  );
}
