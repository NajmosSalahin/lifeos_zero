import { type LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface Props { title: string; value: string|number; unit?: string; trend?: number; icon?: LucideIcon; color?: string; description?: string; className?: string; }
export const StatCard = ({ title, value, unit, trend, icon: Icon, color, description, className }: Props) => {
  const TrendIcon = trend == null ? null : trend >= 0 ? TrendingUp : TrendingDown;
  const trendColor = trend == null ? '' : trend >= 0 ? '#10b981' : '#ef4444';
  return (
    <div className={cn('rounded-xl border p-5 transition-colors hover:border-[var(--color-border-active)]', className)}
      style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm font-medium" style={{ color:'var(--color-text-muted)' }}>{title}</span>
        {Icon && <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: color ? `${color}20` : 'var(--color-surface-2)' }}>
          <Icon className="h-4 w-4" style={{ color: color ?? 'var(--color-text-muted)' }} /></div>}
      </div>
      <div className="flex items-end gap-1 mb-2">
        <span className="text-2xl font-bold tabular-nums" style={{ color:'var(--color-text-primary)' }}>{value}</span>
        {unit && <span className="text-sm mb-0.5" style={{ color:'var(--color-text-muted)' }}>{unit}</span>}
      </div>
      {(TrendIcon || description) && (
        <div className="flex items-center gap-2">
          {TrendIcon && trend != null && <span className="flex items-center gap-1 text-xs font-medium" style={{ color: trendColor }}>
            <TrendIcon className="h-3.5 w-3.5" />{Math.abs(trend)}%</span>}
          {description && <span className="text-xs" style={{ color:'var(--color-text-muted)' }}>{description}</span>}
        </div>
      )}
    </div>
  );
};
