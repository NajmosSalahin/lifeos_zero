import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Smile, Plus, Trash2 } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { useToast } from '../../../shared/hooks/useToast';
import { formatDate, formatTime } from '../../../shared/lib/utils';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const MOOD_EMOJIS = ['','😞','😟','😕','😐','😶','🙂','😊','😄','😁','🤩'];
  const MOOD_LABELS = ['','terrible','bad','poor','okay','neutral','good','great','excellent','amazing','perfect'];
const MOOD_COLORS = ['','#ef4444','#f97316','#f59e0b','#eab308','#84cc16','#22c55e','#10b981','#06b6d4','#3b82f6','#8b5cf6'];

export default function MoodPage() {
  const [score, setScore] = useState(7);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [showLog, setShowLog] = useState(false);
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data: moodData, isLoading } = useQuery({ queryKey: qk.mood.all(), queryFn: () => api.get('/mood').then(r => r.data.data) });
  const { data: insights } = useQuery({ queryKey: qk.mood.insights(), queryFn: () => api.get('/mood/insights').then(r => r.data.data.insights) });

  const logMut = useMutation({
    mutationFn: () => api.post('/mood', { score, note, tags: tags.split(',').map(t=>t.trim()).filter(Boolean), loggedAt: new Date() }),
    onSuccess: () => { qc.invalidateQueries({queryKey:['mood']}); success('Mood logged!'); setNote(''); setTags(''); setShowLog(false); },
    onError: (e:any) => error(e?.response?.data?.error?.message||'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/mood/${id}`),
    onSuccess: () => qc.invalidateQueries({queryKey:['mood']}),
  });

  const chartData = moodData?.items?.slice(0,30).reverse().map((m:any,i:number)=>({ day: formatDate(m.loggedAt), score: m.score })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>mood</h1>
          {insights && <p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>average: {insights.average}/10 · {insights.trend}</p>}
        </div>
        <button onClick={()=>setShowLog(!showLog)} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor:'var(--color-accent)' }}>
          <Plus className="h-4 w-4" /> log mood
        </button>
      </div>

      {/* Log form */}
      {showLog && (
        <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>how are you feeling?</h2>
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">{MOOD_EMOJIS[score]}</div>
            <div className="font-medium mb-1" style={{ color:'var(--color-text-primary)' }}>{MOOD_LABELS[score]}</div>
            <span className="text-3xl font-bold tabular-nums" style={{ color: MOOD_COLORS[score] }}>{score}</span>
            <span className="text-lg" style={{ color:'var(--color-text-muted)' }}>/10</span>
          </div>
          <input type="range" min={1} max={10} value={score} onChange={e=>setScore(Number(e.target.value))} className="w-full accent-[var(--color-accent)] mb-4" />
          <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="What's on your mind? (optional)" rows={2}
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:border-[var(--color-accent)] mb-3"
            style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          <input value={tags} onChange={e=>setTags(e.target.value)} placeholder="Tags (comma-separated: grateful, tired, anxious…)"
            className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)] mb-4"
            style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          <div className="flex gap-2">
            <button onClick={()=>setShowLog(false)} className="flex-1 rounded-lg border py-2 text-sm" style={{ borderColor:'var(--color-border)', color:'var(--color-text-secondary)' }}>cancel</button>
            <button onClick={()=>logMut.mutate()} disabled={logMut.isPending} className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor:'var(--color-accent)' }}>
              {logMut.isPending?'saving…':'save mood'}
            </button>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>mood trend</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="day" tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis domain={[1,10]} tick={{ fontSize:10, fill:'var(--color-text-muted)' }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ backgroundColor:'var(--color-surface-2)', border:'1px solid var(--color-border)', borderRadius:8, fontSize:12 }} />
              <Line type="monotone" dataKey="score" stroke="var(--color-accent)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      <div className="space-y-2">
        {moodData?.items?.length === 0 && <EmptyState icon={Smile} title="no mood logs yet" description="start tracking how you feel each day." />}
        {moodData?.items?.map((m: any) => (
          <div key={m._id} className="flex items-center gap-4 rounded-xl border px-4 py-3 hover:border-[var(--color-border-active)] transition-colors"
            style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <span className="text-2xl shrink-0">{MOOD_EMOJIS[m.score]}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold tabular-nums" style={{ color: MOOD_COLORS[m.score] }}>{m.score}</span>
                <span className="text-sm" style={{ color:'var(--color-text-secondary)' }}>{MOOD_LABELS[m.score]}</span>
                {m.tags?.length > 0 && m.tags.map((t:string) => <span key={t} className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor:'var(--color-surface-2)', color:'var(--color-text-muted)' }}>{t}</span>)}
              </div>
              {m.note && <p className="text-xs mt-0.5 truncate" style={{ color:'var(--color-text-muted)' }}>{m.note}</p>}
              <p className="text-xs mt-0.5" style={{ color:'var(--color-text-muted)' }}>{formatDate(m.loggedAt)} {formatTime(m.loggedAt)}</p>
            </div>
            <button onClick={()=>deleteMut.mutate(m._id)} className="shrink-0 rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] hover:text-rose-400 transition-colors" style={{ color:'var(--color-text-muted)' }}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
