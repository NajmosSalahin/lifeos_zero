import { startOfDay } from 'date-fns';
import { BreathingTechnique } from '../../models/BreathingTechnique.model';
import { BreathingSession } from '../../models/BreathingSession.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
export class BreathingService {
  async listTechniques(userId: string) { return BreathingTechnique.find({ $or: [{ isSystem: true }, { userId }] }).lean(); }
  async createTechnique(userId: string, dto: any) {
    const total = dto.phases.reduce((s: number, p: any) => s + p.durationSeconds, 0);
    return BreathingTechnique.create({ ...dto, userId, totalCycleDuration: total });
  }
  async updateTechnique(userId: string, id: string, dto: any) {
    const t = await BreathingTechnique.findById(id);
    if (!t || t.isSystem) throw new NotFoundError('Technique');
    if (t.userId?.toString() !== userId) throw new ForbiddenError();
    if (dto.phases) dto.totalCycleDuration = dto.phases.reduce((s: number, p: any) => s + p.durationSeconds, 0);
    Object.assign(t, dto); return t.save();
  }
  async deleteTechnique(userId: string, id: string) {
    const t = await BreathingTechnique.findById(id);
    if (!t || t.isSystem) throw new NotFoundError('Technique');
    if (t.userId?.toString() !== userId) throw new ForbiddenError();
    await t.deleteOne();
  }
  async createSession(userId: string, dto: any) {
    const tech = await BreathingTechnique.findById(dto.techniqueId).lean();
    if (!tech) throw new NotFoundError('Technique');
    const completedAt = new Date(); const date = startOfDay(completedAt);
    return BreathingSession.create({ ...dto, userId, techniqueName: tech.name, completedAt: dto.completedAt || completedAt, date });
  }
  async listSessions(userId: string, q: any = {}) {
    const query: any = { userId };
    if (q.from || q.to) { query.date = {}; if (q.from) query.date.$gte = new Date(q.from); if (q.to) query.date.$lte = new Date(q.to); }
    const page = Math.max(1, Number(q.page)||1); const limit = Math.min(100, Number(q.limit)||20);
    const [items, total] = await Promise.all([BreathingSession.find(query).sort({ date: -1 }).skip((page-1)*limit).limit(limit).lean(), BreathingSession.countDocuments(query)]);
    return { items, total, page, limit };
  }
  async getSessionStats(userId: string) {
    const sessions = await BreathingSession.find({ userId }).lean();
    const total = sessions.length;
    const totalDuration = sessions.reduce((s, x) => s + x.durationSeconds, 0);
    const avgDuration = total ? Math.round(totalDuration / total) : 0;
    return { totalSessions: total, totalDurationSeconds: totalDuration, averageDurationSeconds: avgDuration };
  }
  async deleteSession(userId: string, id: string) {
    const s = await BreathingSession.findById(id);
    if (!s) throw new NotFoundError('Session');
    if (s.userId.toString() !== userId) throw new ForbiddenError();
    await s.deleteOne();
  }
}
export const breathingService = new BreathingService();
