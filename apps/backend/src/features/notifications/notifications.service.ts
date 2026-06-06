import { Notification } from '../../models/Notification.model';
import { NotFoundError, ForbiddenError } from '../../shared/errors/AppError';
export class NotificationsService {
  async list(userId: string) { return Notification.find({ userId }).sort({ createdAt: -1 }).limit(50).lean(); }
  async unreadCount(userId: string) { return Notification.countDocuments({ userId, isRead: false }); }
  async markRead(userId: string, id: string) {
    const n = await Notification.findById(id);
    if (!n) throw new NotFoundError('Notification');
    if (n.userId.toString() !== userId) throw new ForbiddenError();
    n.isRead = true; n.readAt = new Date(); return n.save();
  }
  async markAllRead(userId: string) { await Notification.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() }); }
  async delete(userId: string, id: string) {
    const n = await Notification.findById(id);
    if (!n) throw new NotFoundError('Notification');
    if (n.userId.toString() !== userId) throw new ForbiddenError();
    await n.deleteOne();
  }
  async create(userId: string, data: { type: string; title: string; body: string; actionUrl?: string; metadata?: any }) {
    return Notification.create({ userId, ...data });
  }
}
export const notificationsService = new NotificationsService();
