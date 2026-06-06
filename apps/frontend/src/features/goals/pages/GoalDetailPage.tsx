import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Check, Trash2 } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { useToast } from '../../../shared/hooks/useToast';
import { formatDate } from '../../../shared/lib/utils';

export default function GoalDetailPage() {
  const { id } = useParams<{id:string}>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { success, error } = useToast();
  const [newProgress, setNewProgress] = useState('');
  const [newMilestone, setNewMilestone] = useState('');

  const { data, isLoading } = useQuery({ queryKey: qk.goals.one(id!), queryFn: () => api.get(`/goals/${id}`).then(r=>r.data.data.goal) });
  const goal = data;
  const pct = goal ? Math.min(100, Math.round((goal.currentValue/goal.targetValue)*100)) : 0;

  const progressMut = useMutation({
    mutationFn: (v:number) => api.patch(`/goals/${id}/progress`, { currentValue: v }),
    onSuccess: () => { qc.invalidateQueries({queryKey:['goals']}); success('Progress updated!'); setNewProgress(''); },
  });

  const addMilestoneMut = useMutation({
    mutationFn: (title:string) => api.post(`/goals/${id}/milestones`, { title }),
    onSuccess: () => { qc.invalidateQueries({queryKey:['goals']}); setNewMilestone(''); },
  });

  const completeMilestoneMut = useMutation({
    mutationFn: (mid:string) => api.patch(`/goals/${id}/milestones/${mid}/complete`),
    onSuccess: () => qc.invalidateQueries({queryKey:['goals']}),
  });

  const deleteMilestoneMut = useMutation({
    mutationFn: (mid:string) => api.delete(`/goals/${id}/milestones/${mid}`),
    onSuccess: () => qc.invalidateQueries({queryKey:['goals']}),
  });

  if (isLoading) return <div className="flex justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--color-border)] border-t-[var(--color-accent)]" /></div>;
  if (!goal) return <div>Goal not found</div>;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={()=>navigate('/goals')} className="flex items-center gap-2 text-sm transition-colors" style={{ color:'var(--color-text-muted)' }}><ArrowLeft className="h-4 w-4" /> Back to Goals</button>
      <div className="rounded-xl border p-6" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl" style={{ backgroundColor:`${goal.color||'#22c55e'}20` }}>
            <span className="text-xl">🎯</span>
          </div>
          <div>
            <h1 className="text-xl font-bold" style={{ color:'var(--color-text-primary)' }}>{goal.title}</h1>
            <p className="text-sm" style={{ color:'var(--color-text-muted)' }}>{goal.category} · {goal.priority} priority</p>
          </div>
        </div>
        {goal.description && <p className="text-sm mb-4" style={{ color:'var(--color-text-secondary)' }}>{goal.description}</p>}
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium" style={{ color:'var(--color-text-secondary)' }}>Progress</span>
          <span className="text-sm font-bold" style={{ color:'var(--color-text-primary)' }}>{goal.currentValue}/{goal.targetValue} {goal.unit} ({pct}%)</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden mb-4" style={{ backgroundColor:'var(--color-surface-2)' }}>
          <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, backgroundColor:goal.color||'#22c55e' }} />
        </div>
        <div className="flex gap-2">
          <input type="number" value={newProgress} onChange={e=>setNewProgress(e.target.value)} placeholder={`Update progress (current: ${goal.currentValue})`}
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          <button onClick={()=>newProgress&&progressMut.mutate(Number(newProgress))} disabled={!newProgress||progressMut.isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor:'var(--color-accent)' }}>Update</button>
        </div>
        {goal.targetDate && <p className="text-xs mt-3" style={{ color:'var(--color-text-muted)' }}>📅 Due {formatDate(goal.targetDate)}</p>}
      </div>

      {/* Milestones */}
      <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        <h2 className="font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>Milestones</h2>
        <div className="space-y-2 mb-4">
          {goal.milestones?.length === 0 && <p className="text-sm text-center py-3" style={{ color:'var(--color-text-muted)' }}>No milestones yet</p>}
          {goal.milestones?.map((m: any) => (
            <div key={m._id} className="flex items-center gap-3 rounded-lg p-3" style={{ backgroundColor:'var(--color-surface-2)' }}>
              <button onClick={()=>completeMilestoneMut.mutate(m._id)} className="shrink-0">
                {m.isCompleted ? <Check className="h-5 w-5 text-emerald-400" /> : <div className="h-5 w-5 rounded-full border-2" style={{ borderColor:'var(--color-border)' }} />}
              </button>
              <span className={`flex-1 text-sm ${m.isCompleted?'line-through opacity-50':''}`} style={{ color:'var(--color-text-primary)' }}>{m.title}</span>
              <button onClick={()=>deleteMilestoneMut.mutate(m._id)} className="shrink-0 hover:text-rose-400" style={{ color:'var(--color-text-muted)' }}><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newMilestone} onChange={e=>setNewMilestone(e.target.value)} onKeyDown={e=>e.key==='Enter'&&newMilestone&&addMilestoneMut.mutate(newMilestone)} placeholder="Add milestone…"
            className="flex-1 rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]"
            style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          <button onClick={()=>newMilestone&&addMilestoneMut.mutate(newMilestone)} className="rounded-lg px-3 py-2 text-sm font-medium text-white" style={{ backgroundColor:'var(--color-accent)' }}><Plus className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
