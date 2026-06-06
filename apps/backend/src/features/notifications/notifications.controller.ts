import { asyncHandler } from '../../middleware/asyncHandler'; import { notificationsService } from './notifications.service'; import { sendSuccess } from '../../shared/utils/response';
export const notificationsController = {
  list: asyncHandler(async (req, res) => { const n = await notificationsService.list(req.user!._id!.toString()); sendSuccess(res, { notifications: n }); }),
  unreadCount: asyncHandler(async (req, res) => { const c = await notificationsService.unreadCount(req.user!._id!.toString()); sendSuccess(res, { count: c }); }),
  markRead: asyncHandler(async (req, res) => { const n = await notificationsService.markRead(req.user!._id!.toString(), req.params.id); sendSuccess(res, { notification: n }); }),
  markAllRead: asyncHandler(async (req, res) => { await notificationsService.markAllRead(req.user!._id!.toString()); sendSuccess(res, { message: 'All marked read' }); }),
  delete: asyncHandler(async (req, res) => { await notificationsService.delete(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
};
