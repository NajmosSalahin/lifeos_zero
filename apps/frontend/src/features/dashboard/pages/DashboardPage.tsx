import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../../shared/stores/auth.store';
import { StatCard } from '../../../shared/components/data-display/StatCard';
import { SkeletonCard } from '../../../shared/components/feedback/SkeletonCard';
import { CheckSquare, Smile, Moon, Droplets, Target, BookOpen, Wind, Zap } from 'lucide-react';
import { api } from '../../../shared/lib/axios';
import { qk } from '../../../shared/lib/queryKeys';
import { Link } from 'react-router-dom';
import { formatMinutes } from '../../../shared/lib/utils';

export default function DashboardPage() {
  const user = useAuthStore(s => s.user);
  const today = new Date().toISOString().slice(0, 10);

  const { data: habitsToday, isLoading: loadingHabits } = useQuery({ queryKey: qk.habits.today(), queryFn: () => api.get('/habits/logs/today').then(r => r.data.data.today) });
  const { data: moodToday } = useQuery({ queryKey: qk.mood.today(), queryFn: () => api.get('/mood/today').then(r => r.data.data.moods) });
  const { data: hydrationToday } = useQuery({ queryKey: qk.hydration.today(), queryFn: () => api.get('/hydration/today').then(r => r.data.data) });
  const { data: sleepStats } = useQuery({ queryKey: qk.sleep.stats(), queryFn: () => api.get('/sleep/stats').then(r => r.data.data.stats) });
  const { data: goals } = useQuery({ queryKey: qk.goals.all('active'), queryFn: () => api.get('/goals?status=active').then(r => r.data.data.goals) });
  const { data: journalStats } = useQuery({ queryKey: qk.journal.stats(), queryFn: () => api.get('/journal/stats').then(r => r.data.data.stats) });

  const completedHabits = habitsToday?.filter((h: any) => h.log?.completed).length ?? 0;
  const totalHabits = habitsToday?.length ?? 0;
  const avgMood = moodToday?.length ? (moodToday.reduce((s: number, m: any) => s + m.score, 0) / moodToday.length).toFixed(1) : '--';
  const hydrationPct = hydrationToday?.percentage ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color:'var(--color-text-primary)' }}>
          {greeting}, {user?.firstName}! 👋
        </h1>
        <p className="text-sm mt-0.5" style={{ color:'var(--color-text-muted)' }}>
          {new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loadingHabits ? <SkeletonCard /> : (
          <StatCard title="Habits Today" value={`${completedHabits}/${totalHabits}`} icon={CheckSquare} color="#6366f1" description="completed" />
        )}
        <StatCard title="Mood" value={avgMood} unit="/10" icon={Smile} color="#f59e0b" description="today's average" />
        <StatCard title="Hydration" value={`${hydrationPct}%`} icon={Droplets} color="#3b82f6" description={`${hydrationToday?.total ?? 0}ml of ${hydrationToday?.goal ?? 2500}ml`} />
        <StatCard title="Active Goals" value={goals?.length ?? '--'} icon={Target} color="#22c55e" description="in progress" />
      </div>

      {/* Quick Actions */}
      <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
        <h2 className="text-sm font-semibold mb-3" style={{ color:'var(--color-text-muted)' }}>QUICK ACTIONS</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {[
            { to:'/habits',    icon: CheckSquare, label:'Log Habit',   color:'#6366f1' },
            { to:'/mood',      icon: Smile,       label:'Log Mood',    color:'#f59e0b' },
            { to:'/sleep',     icon: Moon,        label:'Log Sleep',   color:'#8b5cf6' },
            { to:'/hydration', icon: Droplets,    label:'Log Water',   color:'#3b82f6' },
            { to:'/breathing', icon: Wind,        label:'Breathe',     color:'#06b6d4' },
            { to:'/journal/new', icon: BookOpen,  label:'Write',       color:'#ec4899' },
          ].map(({ to, icon: Icon, label, color }) => (
            <Link key={to} to={to} className="flex flex-col items-center gap-2 rounded-xl p-3 transition-colors hover:bg-[var(--color-surface-2)]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor:`${color}20` }}>
                <Icon className="h-5 w-5" style={{ color }} />
              </div>
              <span className="text-xs font-medium" style={{ color:'var(--color-text-secondary)' }}>{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Today's habits */}
        <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color:'var(--color-text-primary)' }}>Today's Habits</h2>
            <Link to="/habits" className="text-xs hover:underline" style={{ color:'var(--color-accent)' }}>View all</Link>
          </div>
          <div className="space-y-2">
            {habitsToday?.slice(0, 5).map((item: any) => (
              <div key={item.habit._id} className="flex items-center gap-3 rounded-lg p-2" style={{ backgroundColor:'var(--color-surface-2)' }}>
                <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${item.log?.completed ? 'bg-emerald-500' : 'bg-[var(--color-surface-3)]'}`}>
                  {item.log?.completed ? '✓' : ''}
                </div>
                <span className="text-sm flex-1" style={{ color:'var(--color-text-primary)' }}>{item.habit.name}</span>
                <span className="text-xs" style={{ color:'var(--color-text-muted)' }}>{item.habit.category}</span>
              </div>
            ))}
            {(!habitsToday || habitsToday.length === 0) && <p className="text-sm text-center py-4" style={{ color:'var(--color-text-muted)' }}>No habits yet — <Link to="/habits" style={{ color:'var(--color-accent)' }}>create one!</Link></p>}
          </div>
        </div>

        {/* Active Goals */}
        <div className="rounded-xl border p-5" style={{ backgroundColor:'var(--color-surface)', borderColor:'var(--color-border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold" style={{ color:'var(--color-text-primary)' }}>Active Goals</h2>
            <Link to="/goals" className="text-xs hover:underline" style={{ color:'var(--color-accent)' }}>View all</Link>
          </div>
          <div className="space-y-3">
            {goals?.slice(0, 4).map((g: any) => {
              const pct = g.targetValue > 0 ? Math.round((g.currentValue / g.targetValue) * 100) : 0;
              return (
                <div key={g._id}>
                  <div className="flex justify-between text-sm mb-1">
                    <span style={{ color:'var(--color-text-primary)' }}>{g.title}</span>
                    <span style={{ color:'var(--color-text-muted)' }}>{pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor:'var(--color-surface-2)' }}>
                    <div className="h-full rounded-full transition-all" style={{ width:`${pct}%`, backgroundColor: g.color || 'var(--color-accent)' }} />
                  </div>
                </div>
              );
            })}
            {(!goals || goals.length === 0) && <p className="text-sm text-center py-4" style={{ color:'var(--color-text-muted)' }}>No goals yet — <Link to="/goals" style={{ color:'var(--color-accent)' }}>set one!</Link></p>}
          </div>
        </div>
      </div>
    </div>
  );
}
