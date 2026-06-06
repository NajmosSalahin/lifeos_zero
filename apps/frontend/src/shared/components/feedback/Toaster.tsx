import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useUIStore } from '../../stores/ui.store';
import { cn } from '../../lib/utils';

const ICONS = { success: CheckCircle, error: XCircle, warning: AlertTriangle, info: Info };
const COLORS = { success:'text-emerald-400', error:'text-rose-400', warning:'text-amber-400', info:'text-blue-400' };

export const Toaster = () => {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map(t => {
        const Icon = ICONS[t.type];
        return (
          <div key={t.id} className={cn('pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-fade-in')}
            style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
            <Icon className={cn('h-5 w-5 mt-0.5 shrink-0', COLORS[t.type])} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color:'var(--color-text-primary)' }}>{t.title}</p>
              {t.description && <p className="text-xs mt-0.5" style={{ color:'var(--color-text-muted)' }}>{t.description}</p>}
            </div>
            <button onClick={() => removeToast(t.id)} className="shrink-0" style={{ color:'var(--color-text-muted)' }}>
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
