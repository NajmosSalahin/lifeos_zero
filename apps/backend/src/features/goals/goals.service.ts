import mongoose, { Types } from 'mongoose';
import { Goal } from '../../models/Goal.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
type MilestoneDocArray = mongoose.Types.DocumentArray<any>;
export class GoalsService {
  private async own(userId: string, id: string) {
    const g = await Goal.findById(id);
    if (!g) throw new NotFoundError('Goal');
    if (g.userId.toString() !== userId) throw new ForbiddenError();
    return g;
  }
  async create(userId: string, dto: any) { return Goal.create({ ...dto, userId, startDate: dto.startDate ? new Date(dto.startDate) : new Date() }); }
  async list(userId: string, q: any = {}) {
    const query: any = { userId, isArchived: false };
    if (q.status) query.status = q.status;
    return Goal.find(query).sort({ createdAt: -1 }).lean();
  }
  async getOne(userId: string, id: string) { return this.own(userId, id); }
  async update(userId: string, id: string, dto: any) { const g = await this.own(userId, id); Object.assign(g, dto); return g.save(); }
  async delete(userId: string, id: string) { const g = await this.own(userId, id); await g.deleteOne(); }
  async updateProgress(userId: string, id: string, currentValue: number) {
    const g = await this.own(userId, id);
    g.currentValue = currentValue;
    if (currentValue >= g.targetValue) { g.status = 'completed'; g.completedAt = new Date(); }
    return g.save();
  }
  async complete(userId: string, id: string) {
    const g = await this.own(userId, id);
    g.status = 'completed'; g.completedAt = new Date(); g.currentValue = g.targetValue; return g.save();
  }
  async addMilestone(userId: string, goalId: string, dto: any) {
    const g = await this.own(userId, goalId);
    g.milestones.push({ ...dto, _id: new mongoose.Types.ObjectId() } as any); return g.save();
  }
  async updateMilestone(userId: string, goalId: string, milestoneId: string, dto: any) {
    const g = await this.own(userId, goalId);
    const m = (g.milestones as MilestoneDocArray).id(milestoneId); if (!m) throw new NotFoundError('Milestone');
    Object.assign(m, dto); return g.save();
  }
  async deleteMilestone(userId: string, goalId: string, milestoneId: string) {
    const g = await this.own(userId, goalId);
    (g.milestones as MilestoneDocArray).pull({ _id: milestoneId }); return g.save();
  }
  async completeMilestone(userId: string, goalId: string, milestoneId: string) {
    const g = await this.own(userId, goalId);
    const m = (g.milestones as MilestoneDocArray).id(milestoneId); if (!m) throw new NotFoundError('Milestone');
    m.isCompleted = !m.isCompleted; m.completedAt = m.isCompleted ? new Date() : null; return g.save();
  }
}
export const goalsService = new GoalsService();
