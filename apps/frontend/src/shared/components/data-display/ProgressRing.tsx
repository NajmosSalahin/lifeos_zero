interface Props { value: number; size?: number; strokeWidth?: number; color?: string; label?: string; sublabel?: string; }
export const ProgressRing = ({ value, size = 80, strokeWidth = 6, color = 'var(--color-accent)', label, sublabel }: Props) => {
  const r = (size - strokeWidth) / 2;
  const circ = r * 2 * Math.PI;
  const offset = circ - (Math.min(100, Math.max(0, value)) / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--color-border)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset} style={{ transition:'stroke-dashoffset 0.6s ease' }} />
      </svg>
      {(label || sublabel) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {label && <span className="text-sm font-bold" style={{ color:'var(--color-text-primary)' }}>{label}</span>}
          {sublabel && <span className="text-xs" style={{ color:'var(--color-text-muted)' }}>{sublabel}</span>}
        </div>
      )}
    </div>
  );
};
