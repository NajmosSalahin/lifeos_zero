import { SleepLog } from '../../models/SleepLog.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
import { startOfDay } from 'date-fns';
export class SleepService {
  async create(userId: string, dto: any) {
    const bedtime = new Date(dto.bedtime); const wakeTime = new Date(dto.wakeTime);
    const date = startOfDay(wakeTime);
    return SleepLog.create({ ...dto, userId, bedtime, wakeTime, date });
  }
  async list(userId: string, q: any = {}) {
    const query: any = { userId };
    if (q.from || q.to) { query.date = {}; if (q.from) query.date.$gte = new Date(q.from); if (q.to) query.date.$lte = new Date(q.to); }
    const page = Math.max(1, Number(q.page)||1); const limit = Math.min(100, Number(q.limit)||20);
    const [items, total] = await Promise.all([SleepLog.find(query).sort({ date: -1 }).skip((page-1)*limit).limit(limit).lean(), SleepLog.countDocuments(query)]);
    return { items, total, page, limit };
  }
  async update(userId: string, id: string, dto: any) {
    const s = await SleepLog.findById(id);
    if (!s) throw new NotFoundError('Sleep log');
    if (s.userId.toString() !== userId) throw new ForbiddenError();
    Object.assign(s, dto); return s.save();
  }
  async delete(userId: string, id: string) {
    const s = await SleepLog.findById(id);
    if (!s) throw new NotFoundError('Sleep log');
    if (s.userId.toString() !== userId) throw new ForbiddenError();
    await s.deleteOne();
  }
  async getStats(userId: string) {
    const logs = await SleepLog.find({ userId }).lean();
    if (!logs.length) return { averageDuration: 0, averageQuality: 0, totalSessions: 0 };
    const durations = logs.map(l => (new Date(l.wakeTime).getTime() - new Date(l.bedtime).getTime()) / 60000);
    const avgDur = durations.reduce((a,b)=>a+b,0) / durations.length;
    const avgQual = logs.reduce((s,l)=>s+l.quality,0) / logs.length;
    return { averageDuration: Math.round(avgDur), averageQuality: Math.round(avgQual*10)/10, totalSessions: logs.length };
  }
}
export const sleepService = new SleepService();
