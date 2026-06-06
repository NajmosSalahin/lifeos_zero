import { startOfDay, endOfDay, format } from 'date-fns';
import { HabitLog } from '../../models/HabitLog.model'; import { MoodLog } from '../../models/MoodLog.model';
import { SleepLog } from '../../models/SleepLog.model'; import { HydrationLog } from '../../models/HydrationLog.model';
import { JournalEntry } from '../../models/JournalEntry.model'; import { BreathingSession } from '../../models/BreathingSession.model';
export class CalendarService {
  async getMonth(userId: string, year: number, month: number) {
    const from = new Date(year, month - 1, 1); const to = new Date(year, month, 0, 23, 59, 59);
    const [habitLogs, moodLogs, sleepLogs, hydrationLogs, journalEntries, breathingSessions] = await Promise.all([
      HabitLog.find({ userId, date: { $gte: from, $lte: to } }).lean(),
      MoodLog.find({ userId, loggedAt: { $gte: from, $lte: to } }).lean(),
      SleepLog.find({ userId, date: { $gte: from, $lte: to } }).lean(),
      HydrationLog.find({ userId, date: { $gte: from, $lte: to } }).lean(),
      JournalEntry.find({ userId, date: { $gte: from, $lte: to } }).select('date title').lean(),
      BreathingSession.find({ userId, date: { $gte: from, $lte: to } }).lean(),
    ]);
    const days: Record<string, any> = {};
    const addDay = (date: Date, module: string) => { const k = format(date, 'yyyy-MM-dd'); if (!days[k]) days[k] = { date: k, modules: [] }; if (!days[k].modules.includes(module)) days[k].modules.push(module); };
    habitLogs.forEach(l => l.completed && addDay(new Date(l.date), 'habits'));
    moodLogs.forEach(l => addDay(new Date(l.loggedAt), 'mood'));
    sleepLogs.forEach(l => addDay(new Date(l.date), 'sleep'));
    hydrationLogs.forEach(l => addDay(new Date(l.date), 'hydration'));
    journalEntries.forEach(e => addDay(new Date(e.date), 'journal'));
    breathingSessions.forEach(s => addDay(new Date(s.date), 'breathing'));
    return Object.values(days);
  }
  async getDay(userId: string, date: string) {
    const d = new Date(date); const from = startOfDay(d); const to = endOfDay(d);
    const [habits, moods, sleep, hydration, journal, breathing] = await Promise.all([
      HabitLog.find({ userId, date: { $gte: from, $lte: to } }).populate('habitId', 'name color icon').lean(),
      MoodLog.find({ userId, loggedAt: { $gte: from, $lte: to } }).lean(),
      SleepLog.find({ userId, date: { $gte: from, $lte: to } }).lean(),
      HydrationLog.find({ userId, date: { $gte: from, $lte: to } }).lean(),
      JournalEntry.find({ userId, date: { $gte: from, $lte: to } }).select('-content').lean(),
      BreathingSession.find({ userId, date: { $gte: from, $lte: to } }).lean(),
    ]);
    return { date, habits, moods, sleep, hydration, journal, breathing };
  }
}
export const calendarService = new CalendarService();
