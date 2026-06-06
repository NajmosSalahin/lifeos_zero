import { JournalEntry } from '../../models/JournalEntry.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
export class JournalService {
  private wordCount(text: string) { return text.trim().split(/\s+/).filter(Boolean).length; }
  async create(userId: string, dto: any) {
    const wc = this.wordCount(dto.contentText || dto.content || '');
    return JournalEntry.create({ ...dto, userId, wordCount: wc, readingTimeMinutes: Math.ceil(wc / 200), date: dto.date ? new Date(dto.date) : new Date() });
  }
  async list(userId: string, q: any = {}) {
    const query: any = { userId };
    if (q.category) query.category = q.category;
    if (q.tag) query.tags = q.tag;
    if (q.favorite === 'true') query.isFavorite = true;
    if (q.from || q.to) { query.date = {}; if (q.from) query.date.$gte = new Date(q.from); if (q.to) query.date.$lte = new Date(q.to); }
    const page = Math.max(1, Number(q.page)||1); const limit = Math.min(100, Number(q.limit)||20);
    const [items, total] = await Promise.all([JournalEntry.find(query).select('-content').sort({ date: -1 }).skip((page-1)*limit).limit(limit).lean(), JournalEntry.countDocuments(query)]);
    return { items, total, page, limit };
  }
  async getOne(userId: string, id: string) {
    const e = await JournalEntry.findById(id).lean();
    if (!e) throw new NotFoundError('Journal entry');
    if (e.userId.toString() !== userId) throw new ForbiddenError();
    return e;
  }
  async update(userId: string, id: string, dto: any) {
    const e = await JournalEntry.findById(id);
    if (!e) throw new NotFoundError('Journal entry');
    if (e.userId.toString() !== userId) throw new ForbiddenError();
    if (dto.contentText || dto.content) { const wc = this.wordCount(dto.contentText || dto.content); dto.wordCount = wc; dto.readingTimeMinutes = Math.ceil(wc/200); }
    Object.assign(e, dto); return e.save();
  }
  async delete(userId: string, id: string) {
    const e = await JournalEntry.findById(id);
    if (!e) throw new NotFoundError('Journal entry');
    if (e.userId.toString() !== userId) throw new ForbiddenError();
    await e.deleteOne();
  }
  async toggleFavorite(userId: string, id: string) {
    const e = await JournalEntry.findById(id);
    if (!e) throw new NotFoundError('Journal entry');
    if (e.userId.toString() !== userId) throw new ForbiddenError();
    e.isFavorite = !e.isFavorite; return e.save();
  }
  async search(userId: string, q: string) {
    return JournalEntry.find({ userId, $text: { $search: q } }, { score: { $meta: 'textScore' } })
      .select('-content').sort({ score: { $meta: 'textScore' } }).limit(20).lean();
  }
  async getTags(userId: string) {
    const result = await JournalEntry.aggregate([{ $match: { userId } }, { $unwind: '$tags' }, { $group: { _id: '$tags', count: { $sum: 1 } } }, { $sort: { count: -1 } }]);
    return result.map(r => ({ tag: r._id, count: r.count }));
  }
  async getCategories(userId: string) {
    return JournalEntry.distinct('category', { userId });
  }
  async getStats(userId: string) {
    const entries = await JournalEntry.find({ userId }).select('wordCount date').lean();
    const totalWords = entries.reduce((s,e) => s + e.wordCount, 0);
    return { totalEntries: entries.length, totalWords, averageWords: entries.length ? Math.round(totalWords/entries.length) : 0 };
  }
}
export const journalService = new JournalService();
