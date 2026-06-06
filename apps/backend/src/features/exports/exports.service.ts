import { HabitLog } from '../../models/HabitLog.model'; import { Habit } from '../../models/Habit.model';
import { MoodLog } from '../../models/MoodLog.model'; import { SleepLog } from '../../models/SleepLog.model';
import { HydrationLog } from '../../models/HydrationLog.model'; import { JournalEntry } from '../../models/JournalEntry.model';
import { Goal } from '../../models/Goal.model'; import { BreathingSession } from '../../models/BreathingSession.model';

export class ExportsService {
  async exportCSV(userId: string, module: string, from?: string, to?: string): Promise<string> {
    const dateFilter: any = {};
    if (from) dateFilter.$gte = new Date(from); if (to) dateFilter.$lte = new Date(to);
    let rows: any[] = []; let headers: string[] = [];
    if (module === 'mood') {
      rows = await MoodLog.find({ userId, ...(Object.keys(dateFilter).length ? { loggedAt: dateFilter } : {}) }).lean();
      headers = ['date','score','note','tags'];
      return [headers.join(','), ...rows.map(r => [r.loggedAt.toISOString().slice(0,10), r.score, `"${r.note}"`, r.tags.join(';')].join(','))].join('\n');
    }
    if (module === 'sleep') {
      rows = await SleepLog.find({ userId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) }).lean();
      headers = ['date','bedtime','wake_time','duration_minutes','quality','note'];
      return [headers.join(','), ...rows.map(r => { const dur = Math.round((new Date(r.wakeTime).getTime()-new Date(r.bedtime).getTime())/60000); return [r.date.toISOString().slice(0,10),r.bedtime.toISOString(),r.wakeTime.toISOString(),dur,r.quality,`"${r.note}"`].join(','); })].join('\n');
    }
    if (module === 'hydration') {
      rows = await HydrationLog.find({ userId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) }).lean();
      headers = ['date','amount_ml','drink_type','note'];
      return [headers.join(','), ...rows.map(r => [r.date.toISOString().slice(0,10),r.amountMl,r.drinkType,`"${r.note}"`].join(','))].join('\n');
    }
    if (module === 'journal') {
      rows = await JournalEntry.find({ userId, ...(Object.keys(dateFilter).length ? { date: dateFilter } : {}) }).lean();
      headers = ['date','title','category','tags','word_count','favorite'];
      return [headers.join(','), ...rows.map(r => [r.date.toISOString().slice(0,10),`"${r.title}"`,r.category,r.tags.join(';'),r.wordCount,r.isFavorite].join(','))].join('\n');
    }
    return 'module,message\n' + module + ',no data available';
  }

  async exportJSON(userId: string): Promise<any> {
    const [habits, habitLogs, moods, sleeps, hydration, journal, goals, breathing] = await Promise.all([
      Habit.find({ userId }).lean(), HabitLog.find({ userId }).lean(),
      MoodLog.find({ userId }).lean(), SleepLog.find({ userId }).lean(),
      HydrationLog.find({ userId }).lean(), JournalEntry.find({ userId }).lean(),
      Goal.find({ userId }).lean(), BreathingSession.find({ userId }).lean(),
    ]);
    return { exportedAt: new Date().toISOString(), userId, data: { habits, habitLogs, moods, sleeps, hydration, journal, goals, breathing } };
  }

  async exportMarkdown(userId: string, module: string): Promise<string> {
    if (module === 'journal') {
      const entries = await JournalEntry.find({ userId }).sort({ date: -1 }).lean();
      return entries.map(e => `# ${e.title}\n_${e.date.toISOString().slice(0,10)}_ | ${e.category} | Tags: ${e.tags.join(', ')}\n\n${e.contentText}`).join('\n\n---\n\n');
    }
    return `# ${module} export\n\nNo markdown export available for this module.`;
  }
}
export const exportsService = new ExportsService();
