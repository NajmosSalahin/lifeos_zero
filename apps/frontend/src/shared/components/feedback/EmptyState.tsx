import { type LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props { icon?: LucideIcon; title: string; description?: string; action?: { label: string; onClick: () => void }; className?: string; }

export const EmptyState = ({ icon: Icon, title, description, action, className }: Props) => (
  <div className={cn('flex flex-col items-center justify-center py-16 px-8 text-center', className)}>
    {Icon && (
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor:'var(--color-surface-2)' }}>
        <Icon className="h-8 w-8" style={{ color:'var(--color-text-muted)' }} strokeWidth={1.5} />
      </div>
    )}
    <h3 className="text-base font-semibold mb-1" style={{ color:'var(--color-text-primary)' }}>{title}</h3>
    {description && <p className="text-sm mb-5 max-w-xs" style={{ color:'var(--color-text-muted)' }}>{description}</p>}
    {action && (
      <button onClick={action.onClick} className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90"
        style={{ backgroundColor:'var(--color-accent)' }}>{action.label}</button>
    )}
  </div>
);
