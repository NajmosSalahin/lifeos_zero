import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, CheckCircle, Circle, Archive, Trash2, Edit2, Flame } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { SkeletonList } from '../../../shared/components/feedback/SkeletonCard';
import { useToast } from '../../../shared/hooks/useToast';
import { cn } from '../../../shared/lib/utils';

const CATEGORIES = ['all','health','fitness','mindfulness','productivity','learning','social','creativity','finance','other'];
const COLORS = ['#6366f1','#f59e0b','#22c55e','#ef4444','#8b5cf6','#3b82f6','#ec4899','#06b6d4','#f97316'];

function HabitForm({ habit, onClose }: { habit?: any; onClose: () => void }) {
  const qc = useQueryClient();
  const { success, error } = useToast();
  const [form, setForm] = useState({ name: habit?.name||'', description: habit?.description||'', category: habit?.category||'health', color: habit?.color||'#6366f1', targetCount: habit?.targetCount||1, unit: habit?.unit||'times', frequency: habit?.frequency||'daily' });

  const save = useMutation({
    mutationFn: (data: any) => habit ? api.patch(`/habits/${habit._id}`, data) : api.post('/habits', data),
    onSuccess: () => { qc.invalidateQueries({queryKey:['habits']}); success(habit?'Habit updated':'Habit created'); onClose(); },
    onError: (e:any) => error(e?.response?.data?.error?.message||'Failed'),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={e => e.target===e.currentTarget&&onClose()}>
      <div className="w-full max-w-md rounded-2xl border p-6" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        <h2 className="text-lg font-semibold mb-4" style={{ color:'var(--color-text-primary)' }}>{habit?'Edit Habit':'New Habit'}</h2>
        <div className="space-y-3">
          <input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Habit name" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          <input value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Description (optional)" className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--color-accent)]" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={e=>setForm(f=>({...f,category:e.target.value}))} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }}>
              {CATEGORIES.slice(1).map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={form.frequency} onChange={e=>setForm(f=>({...f,frequency:e.target.value}))} className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }}>
              {['daily','weekly','monthly'].map(f=><option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input type="number" value={form.targetCount} onChange={e=>setForm(f=>({...f,targetCount:Number(e.target.value)}))} min={1} placeholder="Target count" className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
            <input value={form.unit} onChange={e=>setForm(f=>({...f,unit:e.target.value}))} placeholder="Unit (times, mins…)" className="rounded-lg border px-3 py-2 text-sm outline-none" style={{ backgroundColor:'var(--color-surface-2)', borderColor:'var(--color-border)', color:'var(--color-text-primary)' }} />
          </div>
          <div className="flex gap-2 flex-wrap">
            {COLORS.map(c=><button key={c} type="button" onClick={()=>setForm(f=>({...f,color:c}))} className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110" style={{ backgroundColor:c, borderColor: form.color===c?'var(--color-text-primary)':'transparent' }} />)}
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={onClose} className="flex-1 rounded-lg border py-2 text-sm" style={{ borderColor:'var(--color-border)', color:'var(--color-text-secondary)' }}>Cancel</button>
          <button onClick={()=>save.mutate(form)} disabled={!form.name||save.isPending} className="flex-1 rounded-lg py-2 text-sm font-medium text-white disabled:opacity-50" style={{ backgroundColor:'var(--color-accent)' }}>
            {save.isPending?'Saving…':'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const [showForm, setShowForm] = useState(false);
  const [editHabit, setEditHabit] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const qc = useQueryClient();
  const { success, error } = useToast();
  const today = new Date().toISOString().slice(0,10);

  const { data: todayData, isLoading } = useQuery({ queryKey: qk.habits.today(), queryFn: () => api.get('/habits/logs/today').then(r => r.data.data.today) });

  const logMut = useMutation({
    mutationFn: ({ habitId, count }: any) => api.post(`/habits/${habitId}/log`, { date: today, count }),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.habits.today() }),
    onError: (e:any) => error(e?.response?.data?.error?.message||'Failed'),
  });

  const archiveMut = useMutation({
    mutationFn: (id: string) => api.patch(`/habits/${id}/archive`, { archive: true }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); success('Habit archived'); },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/habits/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['habits'] }); success('Habit deleted'); },
  });

  const filtered = todayData?.filter((item: any) => activeCategory === 'all' || item.habit.category === activeCategory) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>Habits</h1>
          <p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>
            {filtered.filter((i:any)=>i.log?.completed).length}/{filtered.length} completed today
          </p>
        </div>
        <button onClick={()=>{setEditHabit(null);setShowForm(true)}} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor:'var(--color-accent)' }}>
          <Plus className="h-4 w-4" /> New Habit
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {CATEGORIES.map(c => (
          <button key={c} onClick={()=>setActiveCategory(c)} className={cn('shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors capitalize', activeCategory===c ? 'text-white' : 'hover:bg-[var(--color-surface-2)]')}
            style={activeCategory===c ? {backgroundColor:'var(--color-accent)'} : {backgroundColor:'var(--color-surface)', border:'1px solid var(--color-border)', color:'var(--color-text-secondary)'}}>
            {c}
          </button>
        ))}
      </div>

      {/* Habits list */}
      {isLoading ? <SkeletonList count={4} /> : filtered.length === 0 ? (
        <EmptyState icon={CheckCircle} title="No habits yet" description="Create your first habit to start tracking." action={{ label:'Create habit', onClick:()=>setShowForm(true) }} />
      ) : (
        <div className="space-y-3">
          {filtered.map((item: any) => {
            const { habit, log } = item;
            const completed = log?.completed ?? false;
            return (
              <div key={habit._id} className="flex items-center gap-4 rounded-xl border p-4 transition-colors hover:border-[var(--color-border-active)]"
                style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
                <button onClick={()=>logMut.mutate({habitId:habit._id, count: completed?0:habit.targetCount})}
                  className="shrink-0 transition-transform hover:scale-110">
                  {completed
                    ? <CheckCircle className="h-6 w-6" style={{ color:'var(--color-accent)' }} />
                    : <Circle className="h-6 w-6" style={{ color:'var(--color-text-muted)' }} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor:habit.color }} />
                    <span className={cn('font-medium text-sm', completed&&'line-through opacity-60')} style={{ color:'var(--color-text-primary)' }}>{habit.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs capitalize" style={{ color:'var(--color-text-muted)' }}>{habit.category}</span>
                    <span className="text-xs" style={{ color:'var(--color-text-muted)' }}>•</span>
                    <span className="text-xs" style={{ color:'var(--color-text-muted)' }}>{habit.targetCount} {habit.unit}/{habit.frequency}</span>
                  </div>
                </div>
                {log?.count > 0 && (
                  <div className="flex items-center gap-1 shrink-0">
                    <Flame className="h-3.5 w-3.5 text-orange-400" />
                    <span className="text-xs font-medium" style={{ color:'var(--color-text-secondary)' }}>{log.count}</span>
                  </div>
                )}
                <div className="flex gap-1 shrink-0">
                  <button onClick={()=>{setEditHabit(habit);setShowForm(true)}} className="rounded-lg p-1.5 transition-colors hover:bg-[var(--color-surface-2)]" style={{ color:'var(--color-text-muted)' }}>
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={()=>archiveMut.mutate(habit._id)} className="rounded-lg p-1.5 transition-colors hover:bg-[var(--color-surface-2)]" style={{ color:'var(--color-text-muted)' }}>
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={()=>{ if(confirm('Delete habit and all logs?')) deleteMut.mutate(habit._id); }} className="rounded-lg p-1.5 transition-colors hover:bg-[var(--color-surface-2)] hover:text-rose-400" style={{ color:'var(--color-text-muted)' }}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {showForm && <HabitForm habit={editHabit} onClose={()=>setShowForm(false)} />}
    </div>
  );
}
