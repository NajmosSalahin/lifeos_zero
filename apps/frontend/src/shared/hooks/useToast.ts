import { useUIStore } from '../stores/ui.store';
import type { Toast } from '../stores/ui.store';

export const useToast = () => {
  const { addToast, removeToast } = useUIStore();

  const toast = (opts: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    const duration = opts.duration ?? 4000;
    addToast({ ...opts, id } as Toast);
    if (duration) setTimeout(() => removeToast(id), duration);
  };

  return {
    toast,
    success: (title: string, description?: string) => toast({ type: 'success', title, description }),
    error:   (title: string, description?: string) => toast({ type: 'error',   title, description }),
    info:    (title: string, description?: string) => toast({ type: 'info',    title, description }),
    warning: (title: string, description?: string) => toast({ type: 'warning', title, description }),
  };
};
