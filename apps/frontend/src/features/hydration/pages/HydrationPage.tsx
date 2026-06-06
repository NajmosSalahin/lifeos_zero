import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Droplets, Plus, Trash2 } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { ProgressRing } from '../../../shared/components/data-display/ProgressRing';
import { useToast } from '../../../shared/hooks/useToast';
import { formatTime } from '../../../shared/lib/utils';

export default function HydrationPage() {
  const qc = useQueryClient();
  const { success, error } = useToast();

  const { data: today } = useQuery({ queryKey: qk.hydration.today(), queryFn: () => api.get('/hydration/today').then(r => r.data.data) });
  const { data: templates } = useQuery({ queryKey: qk.hydration.templates(), queryFn: () => api.get('/drink-templates').then(r => r.data.data.templates) });

  const logMut = useMutation({
    mutationFn: (dto: any) => api.post('/hydration', dto),
    onSuccess: () => { qc.invalidateQueries({queryKey:['hydration']}); success('Logged!'); },
    onError: (e:any) => error(e?.response?.data?.error?.message||'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/hydration/${id}`),
    onSuccess: () => qc.invalidateQueries({queryKey:['hydration']}),
  });

  const systemTemplates = templates?.filter((t:any) => t.isSystem) ?? [];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>Hydration</h1><p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>Stay hydrated throughout the day</p></div>

      {/* Progress */}
      <div className="rounded-xl border p-6 flex items-center gap-6" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        <ProgressRing value={today?.percentage??0} size={100} strokeWidth={8} label={`${today?.percentage??0}%`} sublabel="of goal" />
        <div>
          <p className="text-3xl font-bold tabular-nums" style={{ color:'var(--color-text-primary)' }}>{today?.total??0}<span className="text-base font-normal ml-1" style={{ color:'var(--color-text-muted)' }}>ml</span></p>
          <p className="text-sm" style={{ color:'var(--color-text-muted)' }}>of {today?.goal??2500}ml goal</p>
          <p className="text-xs mt-1" style={{ color:'var(--color-text-muted)' }}>{today?.goal && today?.total ? Math.max(0, today.goal - today.total) : today?.goal ?? 2500}ml remaining</p>
        </div>
      </div>

      {/* Quick add buttons */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color:'var(--color-text-muted)' }}>QUICK ADD</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {systemTemplates.map((t: any) => (
            <button key={t._id} onClick={()=>logMut.mutate({amountMl:t.amountMl,drinkType:t.drinkType,templateId:t._id})}
              className="flex flex-col items-center gap-1.5 rounded-xl border p-3 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-surface-2)]"
              style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <span className="text-xl">💧</span>
              <span className="text-xs font-medium" style={{ color:'var(--color-text-primary)' }}>{t.amountMl}ml</span>
              <span className="text-xs" style={{ color:'var(--color-text-muted)' }}>{t.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today's log */}
      <div>
        <h2 className="text-sm font-semibold mb-3" style={{ color:'var(--color-text-muted)' }}>TODAY'S LOG</h2>
        <div className="space-y-2">
          {today?.logs?.length === 0 && <p className="text-center py-8 text-sm" style={{ color:'var(--color-text-muted)' }}>No drinks logged yet today</p>}
          {today?.logs?.map((l: any) => (
            <div key={l._id} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
              <Droplets className="h-4 w-4 text-blue-400 shrink-0" />
              <div className="flex-1">
                <span className="text-sm font-medium" style={{ color:'var(--color-text-primary)' }}>{l.amountMl}ml</span>
                <span className="text-xs ml-2 capitalize" style={{ color:'var(--color-text-muted)' }}>{l.drinkType}</span>
              </div>
              <span className="text-xs" style={{ color:'var(--color-text-muted)' }}>{formatTime(l.loggedAt)}</span>
              <button onClick={()=>deleteMut.mutate(l._id)} className="rounded p-1 hover:text-rose-400 transition-colors" style={{ color:'var(--color-text-muted)' }}>
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
