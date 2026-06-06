import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Moon, Plus, Trash2, Star } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { StatCard } from '../../../shared/components/data-display/StatCard';
import { useToast } from '../../../shared/hooks/useToast';
import { formatDate, formatMinutes } from '../../../shared/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function SleepPage() {
  const [showLog, setShowLog] = useState(false);
  const [form, setForm] = useState({ bedtime: '', wakeTime: '', quality: 4, note: '' });
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data, isLoading } = useQuery({ queryKey: qk.sleep.all(), queryFn: () => api.get('/sleep').then(r => r.data.data) });
  const { data: statsData } = useQuery({ queryKey: qk.sleep.stats(), queryFn: () => api.get('/sleep/stats').then(r => r.data.data.stats) });

  const logMut = useMutation({
    mutationFn: () => api.post('/sleep', form),
    onSuccess: () => { qc.invalidateQueries({queryKey:['sleep']}); success('Sleep logged!'); setShowLog(false); setForm({ bedtime:'', wakeTime:'', quality:4, note:'' }); },
    onError: (e:any) => error(e?.response?.data?.error?.message||'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/sleep/${id}`),
    onSuccess: () => qc.invalidateQueries({queryKey:['sleep']}),
  });

  const items = data?.items ?? [];
  const chartData = items.slice(0,14).reverse().map((s:any) => ({
    date: new Date(s.date).toLocaleDateString('en-US',{month:'short',day:'numeric'}),
    duration: Math.round((new Date(s.wakeTime).getTime()-new Date(s.bedtime).getTime())/3600000*10)/10,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>Sleep</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>Track your sleep patterns</p>
        </div>
        <button onClick={()=>setShowLog(!showLog)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor:'var(--color-accent)' }}>
          <Plus className="h-4 w-4" /> Log Sleep
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard title="Avg Duration" value={statsData ? formatMinutes(statsData.averageDuration) : '--'} icon={Moon} color="#8b5cf6" description="per night" />
        <StatCard title="Avg Quality" value={statsData?.averageQuality??'--'} unit="/5" icon={Star} color="#f59e0b" description="rating" />
        <StatCard title="Total Sessions" value={statsData?.totalSessions??'--'} description="logged" />
      </div>

      {showLog && (
        <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>Log Sleep</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs mb-1" style={{ color:'var(--color-text-muted)' }}>Bedtime</label>
              <input type="datetime-local" value={form.bedtime} onChange={e=>setForm(f=>({...f,bedtime:e.target.value}))}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color:'var(--color-text-muted)' }}>Wake time</label>
              <input type="datetime-local" value={form.wakeTime} onChange={e=>setForm(f=>({...f,wakeTime:e.target.value}))}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
                style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-xs mb-1" style={{ color:'var(--color-text-muted)' }}>Quality (1–5)</label>
            <div className="flex gap-2">
              {[1,2,3,4,5].map(q=>(
                <button key={q} onClick={()=>setForm(f=>({...f,quality:q}))} className="flex-1 rounded-lg py-2 text-sm font-medium transition-colors"
                  style={{ backgroundColor: form.quality===q ? 'var(--color-accent)' : 'var(--color-surface-2)', color: form.quality===q ? '#fff' : 'var(--color-text-secondary)' }}>
                  {'⭐'.repeat(q)}
                </button>
              ))}
            </div>
          </div>
          <textarea value={form.note} onChange={e=>setForm(f=>({...f,note:e.target.value}))} placeholder="Notes (optional)" rows={2}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:border-[var(--color-accent)] mb-4"
            style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          <div className="flex gap-2">
            <button onClick={()=>setShowLog(false)} className="flex-1 rounded-lg border py-2 text-sm" style={{ borderColor:'var(--color-border)', color:'var(--color-text-secondary)' }}>Cancel</button>
            <button onClick={()=>logMut.mutate()} disabled={!form.bedtime||!form.wakeTime||logMut.isPending} className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor:'var(--color-accent)' }}>
              {logMut.isPending?'Saving…':'Save'}
            </button>
          </div>
        </div>
      )}

      {chartData.length > 1 && (
        <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>Sleep Duration (hours)</h2>
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

      <div className="space-y-2">
        {items.length === 0 && <EmptyState icon={Moon} title="No sleep logs yet" description="Track your first night of sleep." />}
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
