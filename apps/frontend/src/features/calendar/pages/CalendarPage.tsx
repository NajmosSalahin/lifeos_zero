import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { cn, formatMinutes } from '../../../shared/lib/utils';

const MODULE_COLORS: Record<string,string> = { habits:'#6366f1', mood:'#f59e0b', sleep:'#8b5cf6', hydration:'#3b82f6', journal:'#ec4899', breathing:'#06b6d4' };
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function CalendarPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string|null>(null);

  const { data: monthData } = useQuery({ queryKey: qk.calendar.month(year, month), queryFn: () => api.get(`/calendar?year=${year}&month=${month}`).then(r=>r.data.data.days) });
  const { data: dayData } = useQuery({ queryKey: qk.calendar.day(selectedDate!), queryFn: () => api.get(`/calendar/${selectedDate}`).then(r=>r.data.data), enabled: !!selectedDate });

  const dayMap = new Map<string, { date: string; modules: string[] }>(
    (monthData ?? []).map((d: { date: string; modules: string[] }) => [d.date, d])
  );

  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const today = now.toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>Calendar</h1><p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>Your activity history at a glance</p></div>

      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor:'var(--color-border)' }}>
          <button onClick={prevMonth} className="rounded-lg p-2 transition-colors hover:bg-[var(--color-surface-2)]" style={{ color:'var(--color-text-secondary)' }}>
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="font-semibold" style={{ color:'var(--color-text-primary)' }}>{MONTHS[month-1]} {year}</h2>
          <button onClick={nextMonth} className="rounded-lg p-2 transition-colors hover:bg-[var(--color-surface-2)]" style={{ color:'var(--color-text-secondary)' }}>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b" style={{ borderColor:'var(--color-border)' }}>
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium" style={{ color:'var(--color-text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="h-16 border-b border-r" style={{ borderColor:'var(--color-border)' }} />;
            const dateStr = `${year}-${String(month).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
            const dayInfo = dayMap.get(dateStr);
            const modules: string[] = dayInfo?.modules ?? [];
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            return (
              <div key={dateStr} onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={cn('h-16 border-b border-r p-1.5 cursor-pointer transition-colors hover:bg-[var(--color-surface-2)]', isSelected && 'bg-[var(--color-surface-2)]')}
                style={{ borderColor:'var(--color-border)' }}>
                <div className={cn('flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium mb-1', isToday && 'text-white')}
                  style={isToday ? { backgroundColor:'var(--color-accent)' } : { color:'var(--color-text-secondary)' }}>
                  {day}
                </div>
                <div className="flex flex-wrap gap-0.5">
                  {modules.slice(0, 4).map(m => (
                    <div key={m} className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: MODULE_COLORS[m] || 'var(--color-text-muted)' }} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 px-5 py-3 border-t" style={{ borderColor:'var(--color-border)' }}>
          {Object.entries(MODULE_COLORS).map(([mod, color]) => (
            <div key={mod} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs capitalize" style={{ color:'var(--color-text-muted)' }}>{mod}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day detail panel */}
      {selectedDate && dayData && (
        <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color:'var(--color-text-primary)' }}>
              {new Date(selectedDate).toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
            </h2>
            <button onClick={() => setSelectedDate(null)} className="rounded-lg p-1.5 hover:bg-[var(--color-surface-2)]" style={{ color:'var(--color-text-muted)' }}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {dayData.habits?.filter((h: any) => h.completed).length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--color-text-muted)' }}>HABITS</p>
                <div className="flex flex-wrap gap-2">
                  {dayData.habits.filter((h: any) => h.completed).map((h: any) => (
                    <span key={h._id} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor:'#6366f120', color:'#6366f1' }}>
                      {(h.habitId as any)?.name || 'Habit'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {dayData.moods?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--color-text-muted)' }}>MOOD</p>
                <div className="flex gap-2">
                  {dayData.moods.map((m: any) => (
                    <span key={m._id} className="text-sm px-3 py-1 rounded-full font-medium" style={{ backgroundColor:'#f59e0b20', color:'#f59e0b' }}>
                      {m.score}/10
                    </span>
                  ))}
                </div>
              </div>
            )}
            {dayData.sleep?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--color-text-muted)' }}>SLEEP</p>
                {dayData.sleep.map((s: any) => {
                  const dur = Math.round((new Date(s.wakeTime).getTime() - new Date(s.bedtime).getTime()) / 60000);
                  return <span key={s._id} className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor:'#8b5cf620', color:'#8b5cf6' }}>{formatMinutes(dur)} · ⭐{s.quality}/5</span>;
                })}
              </div>
            )}
            {dayData.hydration?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--color-text-muted)' }}>HYDRATION</p>
                <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor:'#3b82f620', color:'#3b82f6' }}>
                  {dayData.hydration.reduce((s: number, h: any) => s + h.amountMl, 0)}ml
                </span>
              </div>
            )}
            {dayData.journal?.length > 0 && (
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color:'var(--color-text-muted)' }}>JOURNAL</p>
                <div className="space-y-1">
                  {dayData.journal.map((e: any) => (
                    <p key={e._id} className="text-xs" style={{ color:'var(--color-text-secondary)' }}>📝 {e.title}</p>
                  ))}
                </div>
              </div>
            )}
            {!dayData.habits?.length && !dayData.moods?.length && !dayData.sleep?.length && !dayData.hydration?.length && !dayData.journal?.length && (
              <p className="text-sm text-center py-4" style={{ color:'var(--color-text-muted)' }}>No activity on this day</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
