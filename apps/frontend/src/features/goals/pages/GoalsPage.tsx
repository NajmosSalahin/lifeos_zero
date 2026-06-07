import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Target, Plus, Edit2, Trash2, Check, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { useToast } from '../../../shared/hooks/useToast';
import { formatDate, cn } from '../../../shared/lib/utils';

function GoalForm({ goal, onClose }: { goal?: any; onClose: () => void }) {
  const qc = useQueryClient(); const { success, error } = useToast();
  const [form, setForm] = useState({ title:goal?.title||'', description:goal?.description||'', category:goal?.category||'personal', priority:goal?.priority||'medium', targetValue:goal?.targetValue||100, currentValue:goal?.currentValue||0, unit:goal?.unit||'%', targetDate:goal?.targetDate?goal.targetDate.slice(0,10):'' });
  const save = useMutation({
    mutationFn: (data:any) => goal ? api.patch(`/goals/${goal._id}`,data) : api.post('/goals',{...data,startDate:new Date()}),
    onSuccess: ()=>{ qc.invalidateQueries({queryKey:['goals']}); success(goal?'updated':'created'); onClose(); },
    onError:(e:any)=>error(e?.response?.data?.error?.message||'Failed'),
  });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="w-full max-w-md rounded-2xl border p-6" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>{goal?'edit goal':'new goal'}</h2>
        <div className="space-y-3">
          <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="goal title" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          <textarea value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="description" rows={2} className="w-full rounded-lg border px-3 py-2 text-sm outline-none resize-none focus:border-[var(--color-accent)]" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.priority} onChange={e=>setForm(f=>({...f,priority:e.target.value}))} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }}>
              {['low','medium','high'].map(p=><option key={p} value={p}>{p}</option>)}
            </select>
            <input value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} placeholder="category" className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input type="number" value={form.currentValue} onChange={e=>setForm(f=>({...f,currentValue:Number(e.target.value)}))} placeholder="current" className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
            <input type="number" value={form.targetValue} onChange={e=>setForm(f=>({...f,targetValue:Number(e.target.value)}))} placeholder="target" className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
            <input value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="unit" className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          </div>
          <input type="date" value={form.targetDate} onChange={e=>setForm(f=>({...f,targetDate:e.target.value}))} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 rounded-lg border py-2 text-sm" style={{ borderColor:'var(--color-border)', color:'var(--color-text-secondary)' }}>cancel</button>
          <button onClick={()=>save.mutate(form)} disabled={!form.title||save.isPending} className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor:'var(--color-accent)' }}>{save.isPending?'saving…':'save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const [showForm, setShowForm] = useState(false); const [editGoal, setEditGoal] = useState<any>(null);
  const [status, setStatus] = useState('active');
  const qc = useQueryClient(); const { success } = useToast();
  const { data, isLoading } = useQuery({ queryKey: qk.goals.all(status), queryFn: () => api.get(`/goals?status=${status}`).then(r=>r.data.data.goals) });
  const deleteMut = useMutation({ mutationFn:(id:string)=>api.delete(`/goals/${id}`), onSuccess:()=>{ qc.invalidateQueries({queryKey:['goals']}); success('deleted'); } });
  const completeMut = useMutation({ mutationFn:(id:string)=>api.patch(`/goals/${id}/complete`), onSuccess:()=>{ qc.invalidateQueries({queryKey:['goals']}); success('goal completed! 🎉'); } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>goals</h1><p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>track your progress</p></div>
        <button onClick={()=>{setEditGoal(null);setShowForm(true)}} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor:'var(--color-accent)' }}><Plus className="h-4 w-4" /> new goal</button>
      </div>
      <div className="flex gap-2">
        {['active','completed','paused','abandoned'].map(s=>(
          <button key={s} onClick={()=>setStatus(s)} className={cn('rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors',status===s?'text-white':'hover:bg-[var(--color-surface-2)]')}
            style={status===s?{backgroundColor:'var(--color-accent)'}:{backgroundColor:'var(--color-surface)',border:'1px solid var(--color-border)',color:'var(--color-text-secondary)'}}>{s}</button>
        ))}
      </div>
      {!isLoading && data?.length === 0 && <EmptyState icon={Target} title="no goals yet" description="set your first goal and start making progress." action={{label:'create goal',onClick:()=>setShowForm(true)}} />}
      <div className="space-y-3">
        {data?.map((g: any) => {
          const pct = g.targetValue>0 ? Math.min(100,Math.round((g.currentValue/g.targetValue)*100)) : 0;
          const PRIORITY_COLORS: Record<string,string> = {low:'#22c55e',medium:'#f59e0b',high:'#ef4444'};
          return (
            <div key={g._id} className="rounded-xl border p-4 hover:border-[var(--color-border-active)] transition-colors" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ backgroundColor:`${g.color||'#22c55e'}20` }}>
                  <Target className="h-5 w-5" style={{ color:g.color||'#22c55e' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-sm" style={{ color:'var(--color-text-primary)' }}>{g.title}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor:`${PRIORITY_COLORS[g.priority]}20`, color:PRIORITY_COLORS[g.priority] }}>{g.priority}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor:'var(--color-surface-2)', color:'var(--color-text-muted)' }}>{g.category}</span>
                  </div>
                  {g.targetDate && <p className="text-xs mt-0.5" style={{ color:'var(--color-text-muted)' }}>due {formatDate(g.targetDate)}</p>}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:'var(--color-surface-2)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, backgroundColor:g.color||'#22c55e' }} />
                    </div>
                    <span className="text-xs font-medium shrink-0" style={{ color:'var(--color-text-secondary)' }}>{g.currentValue}/{g.targetValue} {g.unit}</span>
                    <span className="text-xs shrink-0" style={{ color:'var(--color-text-muted)' }}>{pct}%</span>
                  </div>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Link to={`/goals/${g._id}`} className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] transition-colors" style={{ color:'var(--color-text-muted)' }}><ChevronRight className="h-4 w-4" /></Link>
                  <button onClick={()=>{setEditGoal(g);setShowForm(true)}} className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] transition-colors" style={{ color:'var(--color-text-muted)' }}><Edit2 className="h-3.5 w-3.5" /></button>
                  {g.status==='active' &&                   <button onClick={()=>completeMut.mutate(g._id)} className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] transition-colors" style={{ color:'var(--color-text-muted)' }} title="mark complete"><Check className="h-3.5 w-3.5" /></button>}
                  <button onClick={()=>{if(confirm('delete goal?'))deleteMut.mutate(g._id)}} className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)] hover:text-rose-400 transition-colors" style={{ color:'var(--color-text-muted)' }}><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {showForm && <GoalForm goal={editGoal} onClose={()=>setShowForm(false)} />}
    </div>
  );
}
