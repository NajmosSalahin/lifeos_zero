import { startOfDay } from 'date-fns';
import { HydrationLog } from '../../models/HydrationLog.model';
import { DrinkTemplate } from '../../models/DrinkTemplate.model';
import { User } from '../../models/User.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';

export class HydrationService {
  async create(userId: string, dto: any) {
    const loggedAt = dto.loggedAt ? new Date(dto.loggedAt) : new Date();
    const date = startOfDay(loggedAt);
    const waterFactor = dto.waterFactor ?? 1.0;
    const effectiveMl = Math.round(dto.amountMl * waterFactor);
    return HydrationLog.create({ ...dto, userId, loggedAt, date, waterFactor, effectiveMl });
  }

  async list(userId: string, q: any = {}) {
    const query: any = { userId };
    if (q.from || q.to) {
      query.date = {};
      if (q.from) query.date.$gte = new Date(q.from);
      if (q.to)   query.date.$lte = new Date(q.to);
    }
    return HydrationLog.find(query).sort({ loggedAt: -1 }).lean();
  }

  async getToday(userId: string) {
    const today = startOfDay(new Date());
    const user = await User.findById(userId).select('hydrationGoal').lean();
    const logs = await HydrationLog.find({ userId, date: today }).lean();
    const total = logs.reduce((s, l) => s + l.amountMl, 0);
    const effective = logs.reduce((s, l) => s + l.effectiveMl, 0);
    const goal = user?.hydrationGoal || 2500;
    return {
      logs,
      total,
      effective,
      goal,
      percentage: Math.min(100, Math.round((effective / goal) * 100)),
    };
  }

  async delete(userId: string, id: string) {
    const l = await HydrationLog.findById(id);
    if (!l) throw new NotFoundError('Hydration log');
    if (l.userId.toString() !== userId) throw new ForbiddenError();
    await l.deleteOne();
  }

  async getStats(userId: string) {
    const logs = await HydrationLog.find({ userId }).lean();
    const user = await User.findById(userId).select('hydrationGoal').lean();
    const goal = user?.hydrationGoal || 2500;
    const byDay: Record<string, number> = {};
    logs.forEach(l => {
      const d = l.date.toISOString().slice(0, 10);
      byDay[d] = (byDay[d] || 0) + l.effectiveMl;
    });
    const days = Object.values(byDay);
    const avg = days.length ? days.reduce((a, b) => a + b, 0) / days.length : 0;
    const goalMet = days.filter(d => d >= goal).length;
    return {
      averageIntake: Math.round(avg),
      goalMetDays: goalMet,
      totalDays: days.length,
      goalMetRate: days.length ? Math.round((goalMet / days.length) * 100) : 0,
    };
  }

  async updateGoal(userId: string, goal: number) {
    await User.findByIdAndUpdate(userId, { hydrationGoal: goal });
    return { goal };
  }
}

export const hydrationService = new HydrationService();