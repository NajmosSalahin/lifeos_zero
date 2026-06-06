import { DrinkTemplate } from '../../models/DrinkTemplate.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
export class DrinkTemplatesService {
  async list(userId: string) { return DrinkTemplate.find({ $or: [{ isSystem: true }, { userId }] }).lean(); }
  async create(userId: string, dto: any) { return DrinkTemplate.create({ ...dto, userId }); }
  async update(userId: string, id: string, dto: any) {
    const t = await DrinkTemplate.findById(id);
    if (!t || t.isSystem) throw new NotFoundError('Template');
    if (t.userId?.toString() !== userId) throw new ForbiddenError();
    Object.assign(t, dto); return t.save();
  }
  async delete(userId: string, id: string) {
    const t = await DrinkTemplate.findById(id);
    if (!t || t.isSystem) throw new NotFoundError('Template');
    if (t.userId?.toString() !== userId) throw new ForbiddenError();
    await t.deleteOne();
  }
}
export const drinkTemplatesService = new DrinkTemplatesService();
