import { User } from '../../models/User.model';
import { NotFoundError } from '../../shared/errors/AppError';
import { Habit } from '../../models/Habit.model'; import { HabitLog } from '../../models/HabitLog.model';
import { MoodLog } from '../../models/MoodLog.model'; import { SleepLog } from '../../models/SleepLog.model';
import { HydrationLog } from '../../models/HydrationLog.model'; import { JournalEntry } from '../../models/JournalEntry.model';
import { Goal } from '../../models/Goal.model'; import { RefreshToken } from '../../models/RefreshToken.model';

export class UsersService {
  async getMe(userId: string) {
    const u = await User.findById(userId).lean();
    if (!u) throw new NotFoundError('User');
    return u;
  }
  async updateMe(userId: string, dto: any) {
    const u = await User.findByIdAndUpdate(userId, { $set: dto }, { new: true, runValidators: true }).lean();
    if (!u) throw new NotFoundError('User');
    return u;
  }
  async updatePreferences(userId: string, prefs: any) {
    const update: any = {};
    Object.entries(prefs).forEach(([k, v]) => { update[`preferences.${k}`] = v; });
    const u = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).lean();
    if (!u) throw new NotFoundError('User');
    return u?.preferences;
  }
  async saveDashboardLayout(userId: string, layout: any[]) {
    await User.findByIdAndUpdate(userId, { $set: { 'preferences.dashboardLayout': layout } });
  }
  async deleteAccount(userId: string) {
    await Promise.all([
      Habit.deleteMany({ userId }), HabitLog.deleteMany({ userId }), MoodLog.deleteMany({ userId }),
      SleepLog.deleteMany({ userId }), HydrationLog.deleteMany({ userId }), JournalEntry.deleteMany({ userId }),
      Goal.deleteMany({ userId }), RefreshToken.deleteMany({ userId }), User.findByIdAndDelete(userId),
    ]);
  }
  async getStats(userId: string) {
    const [habits, journals, goals, moods, sleeps, hydrations] = await Promise.all([
      Habit.countDocuments({ userId, isArchived: false }),
      JournalEntry.countDocuments({ userId }),
      Goal.countDocuments({ userId, status: 'active' }),
      MoodLog.countDocuments({ userId }),
      SleepLog.countDocuments({ userId }),
      HydrationLog.countDocuments({ userId }),
    ]);
    return { habits, journals, goals, moods, sleeps, hydrations };
  }
}
export const usersService = new UsersService();
