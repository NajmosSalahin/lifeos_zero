import { startOfDay } from 'date-fns';
import { MoodLog } from '../../models/MoodLog.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';

export class MoodService {
  async create(userId: string, dto: any) { return MoodLog.create({ ...dto, userId }); }
  async list(userId: string, q: any = {}) {
    const query: any = { userId };
    if (q.from || q.to) { query.loggedAt = {}; if (q.from) query.loggedAt.$gte = new Date(q.from); if (q.to) query.loggedAt.$lte = new Date(q.to); }
    const page = Math.max(1, Number(q.page) || 1); const limit = Math.min(100, Number(q.limit) || 20);
    const [items, total] = await Promise.all([MoodLog.find(query).sort({ loggedAt: -1 }).skip((page-1)*limit).limit(limit).lean(), MoodLog.countDocuments(query)]);
    return { items, total, page, limit };
  }
  async getToday(userId: string) { return MoodLog.find({ userId, loggedAt: { $gte: startOfDay(new Date()) } }).lean(); }
  async update(userId: string, id: string, dto: any) {
    const m = await MoodLog.findById(id);
    if (!m) throw new NotFoundError('Mood log');
    if (m.userId.toString() !== userId) throw new ForbiddenError();
    Object.assign(m, dto); return m.save();
  }
  async delete(userId: string, id: string) {
    const m = await MoodLog.findById(id);
    if (!m) throw new NotFoundError('Mood log');
    if (m.userId.toString() !== userId) throw new ForbiddenError();
    await m.deleteOne();
  }
  async getInsights(userId: string) {
    const logs = await MoodLog.find({ userId }).lean();
    if (!logs.length) return { average: 0, trend: 'stable', totalEntries: 0 };
    const avg = logs.reduce((s, l) => s + l.score, 0) / logs.length;
    const recent = logs.slice(0, 7); const recentAvg = recent.length ? recent.reduce((s, l) => s + l.score, 0) / recent.length : avg;
    const trend = recentAvg > avg + 0.5 ? 'improving' : recentAvg < avg - 0.5 ? 'declining' : 'stable';
    return { average: Math.round(avg * 10) / 10, trend, totalEntries: logs.length };
  }
  async getCalendar(userId: string, year: number, month: number) {
    const from = new Date(year, month - 1, 1); const to = new Date(year, month, 0);
    const logs = await MoodLog.find({ userId, loggedAt: { $gte: from, $lte: to } }).lean();
    const byDay: Record<string, number[]> = {};
    logs.forEach(l => { const d = l.loggedAt.toISOString().slice(0,10); if (!byDay[d]) byDay[d] = []; byDay[d].push(l.score); });
    return Object.entries(byDay).map(([date, scores]) => ({ date, average: scores.reduce((a,b)=>a+b,0)/scores.length }));
  }
}
export const moodService = new MoodService();
