import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Wind, Play, Pause, RotateCcw, Check } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { useToast } from '../../../shared/hooks/useToast';
import { cn } from '../../../shared/lib/utils';

type Phase = { name: string; durationSeconds: number; instruction: string };

export default function BreathingPage() {
  const [selectedTech, setSelectedTech] = useState<any>(null);
  const [isActive, setIsActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [rating, setRating] = useState(0);
  const intervalRef = useRef<any>(null);
  const qc = useQueryClient();
  const { success } = useToast();

  const { data } = useQuery({ queryKey: qk.breathing.techniques(), queryFn: () => api.get('/breathing/techniques').then(r => r.data.data.techniques) });
  const { data: sessions } = useQuery({ queryKey: qk.breathing.sessions(), queryFn: () => api.get('/breathing/sessions').then(r => r.data.data) });

  const saveMut = useMutation({
    mutationFn: (dto: any) => api.post('/breathing/sessions', dto),
    onSuccess: () => { qc.invalidateQueries({queryKey:['breathing']}); success('Session saved!'); },
  });

  const techniques = data ?? [];
  const currentTech = selectedTech ?? techniques[0];
  const phases: Phase[] = currentTech?.phases ?? [];
  const currentPhase: Phase = phases[phaseIdx] ?? { name:'inhale', durationSeconds:4, instruction:'Breathe in' };
  const phasePct = phases.length ? (elapsed / currentPhase.durationSeconds) * 100 : 0;

  useEffect(() => {
    if (!isActive) { clearInterval(intervalRef.current); return; }
    intervalRef.current = setInterval(() => {
      setElapsed(e => {
        const next = e + 0.1;
        setTotalElapsed(t => t + 0.1);
        if (next >= currentPhase.durationSeconds) {
          const nextIdx = (phaseIdx + 1) % phases.length;
          if (nextIdx === 0) setCycles(c => c + 1);
          setPhaseIdx(nextIdx);
          return 0;
        }
        return next;
      });
    }, 100);
    return () => clearInterval(intervalRef.current);
  }, [isActive, phaseIdx, currentPhase.durationSeconds, phases.length]);

  useEffect(() => {
    if (cycles >= (currentTech?.recommendedCycles ?? 5) && isActive) {
      setIsActive(false); setDone(true);
    }
  }, [cycles, currentTech?.recommendedCycles, isActive]);

  const reset = () => { setIsActive(false); setPhaseIdx(0); setElapsed(0); setCycles(0); setTotalElapsed(0); setDone(false); setRating(0); };

  const saveSession = () => {
    if (!currentTech) return;
    saveMut.mutate({ techniqueId: currentTech._id, durationSeconds: Math.round(totalElapsed), cyclesCompleted: cycles, rating: rating || null });
    reset();
  };

  const PHASE_COLORS: Record<string,string> = { inhale:'#3b82f6', 'hold-in':'#8b5cf6', exhale:'#22c55e', 'hold-out':'#f59e0b' };
  const phaseColor = PHASE_COLORS[currentPhase.name] ?? 'var(--color-accent)';
  const scale = isActive ? 1 + (phasePct / 100) * (currentPhase.name === 'exhale' ? -0.3 : currentPhase.name === 'inhale' ? 0.4 : 0) : 1;

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>Breathing</h1><p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>Guided breathing sessions</p></div>

      {/* Technique selector */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {techniques.map((t: any) => (
          <button key={t._id} onClick={()=>{setSelectedTech(t);reset();}}
            className={cn('shrink-0 rounded-full px-4 py-1.5 text-xs font-medium transition-colors', (selectedTech?._id===t._id||(!selectedTech&&t===techniques[0]))?'text-white':'hover:bg-[var(--color-surface-2)]')}
            style={(selectedTech?._id===t._id||(!selectedTech&&t===techniques[0]))?{backgroundColor:'var(--color-accent)'}:{backgroundColor:'var(--color-surface)', border:'1px solid var(--color-border)', color:'var(--color-text-secondary)'}}>
            {t.name}
          </button>
        ))}
      </div>

      {/* Breathing circle */}
      <div className="rounded-xl border p-8 flex flex-col items-center" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        {done ? (
          <div className="text-center py-4">
            <Check className="h-16 w-16 mx-auto mb-4 text-emerald-400" />
            <h2 className="text-xl font-bold mb-2" style={{ color:'var(--color-text-primary)' }}>Session complete!</h2>
            <p className="text-sm mb-4" style={{ color:'var(--color-text-muted)' }}>{cycles} cycles · {Math.round(totalElapsed)}s</p>
            <div className="flex gap-2 justify-center mb-4">
              {[1,2,3,4,5].map(r=><button key={r} onClick={()=>setRating(r)} className="text-2xl transition-transform hover:scale-110">{r<=rating?'⭐':'☆'}</button>)}
            </div>
            <div className="flex gap-2 justify-center">
              <button onClick={reset} className="rounded-lg border px-4 py-2 text-sm" style={{ borderColor:'var(--color-border)', color:'var(--color-text-secondary)' }}>Do again</button>
              <button onClick={saveSession} className="rounded-lg px-4 py-2 text-sm font-medium text-white" style={{ backgroundColor:'var(--color-accent)' }}>Save session</button>
            </div>
          </div>
        ) : (
          <>
            <div className="relative flex items-center justify-center mb-6" style={{ width:160, height:160 }}>
              <div className="absolute rounded-full transition-all duration-100" style={{ width:160, height:160, backgroundColor:`${phaseColor}15` }} />
              <div className="absolute rounded-full transition-all duration-100" style={{ width:160*0.75*scale, height:160*0.75*scale, backgroundColor:`${phaseColor}30`, border:`2px solid ${phaseColor}` }} />
              <div className="text-center z-10">
                <div className="text-lg font-bold capitalize" style={{ color: phaseColor }}>{currentPhase.name.replace('-',' ')}</div>
                <div className="text-sm" style={{ color:'var(--color-text-muted)' }}>{currentPhase.instruction}</div>
                <div className="text-xs mt-1" style={{ color:'var(--color-text-muted)' }}>{Math.ceil(currentPhase.durationSeconds - elapsed)}s</div>
              </div>
            </div>
            <p className="text-sm mb-6" style={{ color:'var(--color-text-muted)' }}>Cycle {cycles + 1} of {currentTech?.recommendedCycles ?? 5}</p>
            <div className="flex gap-3">
              <button onClick={reset} className="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-[var(--color-surface-2)]" style={{ borderColor:'var(--color-border)', color:'var(--color-text-secondary)' }}>
                <RotateCcw className="h-4 w-4" />
              </button>
              <button onClick={()=>setIsActive(!isActive)} className="flex items-center gap-2 rounded-xl px-6 py-2 text-sm font-medium text-white" style={{ backgroundColor: phaseColor }}>
                {isActive ? <><Pause className="h-4 w-4" />Pause</> : <><Play className="h-4 w-4" />Start</>}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Recent sessions */}
      {sessions && sessions.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color:'var(--color-text-muted)' }}>RECENT SESSIONS</h2>
          <div className="space-y-2">
            {sessions?.slice(0,5).map((s: any) => (
              <div key={s._id} className="flex items-center gap-3 rounded-xl border px-4 py-3" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
                <Wind className="h-4 w-4 text-cyan-400 shrink-0" />
                <div className="flex-1">
                  <span className="text-sm font-medium" style={{ color:'var(--color-text-primary)' }}>{s.techniqueName}</span>
                  <p className="text-xs" style={{ color:'var(--color-text-muted)' }}>{s.cyclesCompleted} cycles · {Math.round(s.durationSeconds)}s</p>
                </div>
                {s.rating && <span className="text-sm">{'⭐'.repeat(s.rating)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
