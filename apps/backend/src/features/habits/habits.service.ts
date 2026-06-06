import { startOfDay, subDays } from 'date-fns';
import { Habit } from '../../models/Habit.model';
import { HabitLog } from '../../models/HabitLog.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';

export class HabitsService {
  private async own(userId: string, habitId: string) {
    const h = await Habit.findById(habitId).lean();
    if (!h) throw new NotFoundError('Habit');
    if (h.userId.toString() !== userId) throw new ForbiddenError();
    return h;
  }

  async create(userId: string, dto: any) {
    const count = await Habit.countDocuments({ userId, isArchived: false });
    return Habit.create({ ...dto, userId, order: count });
  }

  async list(userId: string, filters: any = {}) {
    const query: any = { userId };
    if (!filters.archived) query.isArchived = false;
    if (filters.category) query.category = filters.category;
    return Habit.find(query).sort({ order: 1, createdAt: -1 }).lean();
  }

  async getOne(userId: string, habitId: string) { return this.own(userId, habitId); }

  async update(userId: string, habitId: string, dto: any) {
    await this.own(userId, habitId);
    return Habit.findByIdAndUpdate(habitId, { $set: dto }, { new: true, runValidators: true }).lean();
  }

  async archive(userId: string, habitId: string, archive: boolean) {
    await this.own(userId, habitId);
    return Habit.findByIdAndUpdate(habitId, { $set: { isArchived: archive, archivedAt: archive ? new Date() : null } }, { new: true }).lean();
  }

  async delete(userId: string, habitId: string) {
    await this.own(userId, habitId);
    await HabitLog.deleteMany({ habitId }); await Habit.findByIdAndDelete(habitId);
  }

  async reorder(userId: string, items: { id: string; order: number }[]) {
    await Promise.all(items.map(({ id, order }) => Habit.findOneAndUpdate({ _id: id, userId }, { order })));
  }

  async log(userId: string, habitId: string, date: Date, count: number, note = '') {
    const h = await this.own(userId, habitId);
    const d = startOfDay(date);
    const completed = count >= h.targetCount;
    return HabitLog.findOneAndUpdate({ userId, habitId, date: d }, { $set: { count, completed, note } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  }

  async getLogs(userId: string, filters: any = {}) {
    const query: any = { userId };
    if (filters.habitId) query.habitId = filters.habitId;
    if (filters.from || filters.to) { query.date = {}; if (filters.from) query.date.$gte = new Date(filters.from); if (filters.to) query.date.$lte = new Date(filters.to); }
    return HabitLog.find(query).sort({ date: -1 }).lean();
  }

  async getToday(userId: string) {
    const today = startOfDay(new Date());
    const habits = await this.list(userId);
    const logs = await HabitLog.find({ userId, date: today }).lean();
    const logMap = new Map(logs.map(l => [l.habitId.toString(), l]));
    return habits.map(h => ({ habit: h, log: logMap.get(h._id.toString()) || null }));
  }

  async getStreak(userId: string, habitId: string) {
    await this.own(userId, habitId);
    let streak = 0; let d = startOfDay(new Date());
    while (true) {
      const l = await HabitLog.findOne({ userId, habitId, date: d, completed: true }).lean();
      if (!l) break; streak++; d = subDays(d, 1);
    }
    return { current: streak };
  }

  async getStats(userId: string, habitId: string, days = 30) {
    await this.own(userId, habitId);
    const since = startOfDay(subDays(new Date(), days - 1));
    const completed = await HabitLog.countDocuments({ userId, habitId, date: { $gte: since }, completed: true });
    return { completedDays: completed, totalDays: days, successRate: Math.round((completed / days) * 100) };
  }

  async getCalendar(userId: string, habitId: string, year: number) {
    await this.own(userId, habitId);
    const from = new Date(year, 0, 1); const to = new Date(year, 11, 31);
    const logs = await HabitLog.find({ userId, habitId, date: { $gte: from, $lte: to } }).lean();
    return logs.map(l => ({ date: l.date, completed: l.completed, count: l.count }));
  }
}
export const habitsService = new HabitsService();
