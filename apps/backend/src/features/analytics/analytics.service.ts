import { subDays, startOfDay, eachDayOfInterval, format } from 'date-fns';
import { HabitLog } from '../../models/HabitLog.model';
import { MoodLog } from '../../models/MoodLog.model';
import { SleepLog } from '../../models/SleepLog.model';
import { HydrationLog } from '../../models/HydrationLog.model';
import { BreathingSession } from '../../models/BreathingSession.model';
import { JournalEntry } from '../../models/JournalEntry.model';
import { Goal } from '../../models/Goal.model';
import { User } from '../../models/User.model';

export class AnalyticsService {
  private getRange(from?: string, to?: string) {
    const end = to ? startOfDay(new Date(to)) : startOfDay(new Date());
    const start = from ? startOfDay(new Date(from)) : subDays(end, 29);
    return { start, end };
  }
  async getHabitAnalytics(userId: string, q: any) {
    const { start, end } = this.getRange(q.from, q.to);
    const logs = await HabitLog.find({ userId, date: { $gte: start, $lte: end } }).lean();
    const days = eachDayOfInterval({ start, end });
    const byDay = days.map(d => {
      const dayStr = format(d, 'yyyy-MM-dd');
      const dayLogs = logs.filter(l => format(new Date(l.date), 'yyyy-MM-dd') === dayStr);
      const completed = dayLogs.filter(l => l.completed).length;
      return { date: dayStr, completed, total: dayLogs.length, rate: dayLogs.length ? Math.round((completed/dayLogs.length)*100) : 0 };
    });
    return { byDay, heatmap: byDay.map(d => ({ date: d.date, count: d.completed })) };
  }
  async getMoodAnalytics(userId: string, q: any) {
    const { start, end } = this.getRange(q.from, q.to);
    const logs = await MoodLog.find({ userId, loggedAt: { $gte: start, $lte: end } }).sort({ loggedAt: 1 }).lean();
    const scores = logs.map(l => ({ date: format(new Date(l.loggedAt), 'yyyy-MM-dd'), value: l.score }));
    const avg = logs.length ? logs.reduce((s,l)=>s+l.score,0)/logs.length : 0;
    const dist = [1,2,3,4,5,6,7,8,9,10].map(s => ({ score: s, count: logs.filter(l=>l.score===s).length }));
    return { scores, average: Math.round(avg*10)/10, distribution: dist, totalEntries: logs.length };
  }
  async getSleepAnalytics(userId: string, q: any) {
    const { start, end } = this.getRange(q.from, q.to);
    const logs = await SleepLog.find({ userId, date: { $gte: start, $lte: end } }).sort({ date: 1 }).lean();
    const durations = logs.map(l => ({ date: format(new Date(l.date), 'yyyy-MM-dd'), value: Math.round((new Date(l.wakeTime).getTime()-new Date(l.bedtime).getTime())/60000) }));
    const qualities = logs.map(l => ({ date: format(new Date(l.date), 'yyyy-MM-dd'), value: l.quality }));
    const avgDur = durations.length ? durations.reduce((s,l)=>s+l.value,0)/durations.length : 0;
    const avgQual = qualities.length ? qualities.reduce((s,l)=>s+l.value,0)/qualities.length : 0;
    return { durations, qualities, averageDuration: Math.round(avgDur), averageQuality: Math.round(avgQual*10)/10 };
  }
  async getHydrationAnalytics(userId: string, q: any) {
    const { start, end } = this.getRange(q.from, q.to);
    const logs = await HydrationLog.find({ userId, date: { $gte: start, $lte: end } }).lean();
    const user = await User.findById(userId).select('hydrationGoal').lean();
    const goal = user?.hydrationGoal || 2500;
    const byDay: Record<string, number> = {};
    logs.forEach(l => { const d = format(new Date(l.date), 'yyyy-MM-dd'); byDay[d] = (byDay[d]||0) + l.amountMl; });
    const intake = Object.entries(byDay).map(([date,value]) => ({ date, value })).sort((a,b)=>a.date.localeCompare(b.date));
    const avg = intake.length ? intake.reduce((s,i)=>s+i.value,0)/intake.length : 0;
    return { intake, average: Math.round(avg), goal, goalMetRate: intake.length ? Math.round((intake.filter(i=>i.value>=goal).length/intake.length)*100) : 0 };
  }
  async getOverview(userId: string, q: any) {
    const [habits, mood, sleep, hydration] = await Promise.all([
      this.getHabitAnalytics(userId, q), this.getMoodAnalytics(userId, q),
      this.getSleepAnalytics(userId, q), this.getHydrationAnalytics(userId, q),
    ]);
    return { habits, mood, sleep, hydration };
  }
  async getGoalAnalytics(userId: string) {
    const goals = await Goal.find({ userId }).lean();
    return goals.map(g => ({ id: g._id, title: g.title, status: g.status, progress: g.targetValue > 0 ? Math.round((g.currentValue/g.targetValue)*100) : 0, category: g.category }));
  }
}
export const analyticsService = new AnalyticsService();
