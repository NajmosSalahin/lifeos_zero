import { asyncHandler } from '../../middleware/asyncHandler';
import { moodService } from './mood.service';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';
export const moodController = {
  create: asyncHandler(async (req, res) => { const m = await moodService.create(req.user!._id!.toString(), req.body); sendSuccess(res, { mood: m }, 201); }),
  list: asyncHandler(async (req, res) => { const { items, total, page, limit } = await moodService.list(req.user!._id!.toString(), req.query); sendPaginated(res, items, total, page, limit); }),
  getToday: asyncHandler(async (req, res) => { const m = await moodService.getToday(req.user!._id!.toString()); sendSuccess(res, { moods: m }); }),
  update: asyncHandler(async (req, res) => { const m = await moodService.update(req.user!._id!.toString(), req.params.id, req.body); sendSuccess(res, { mood: m }); }),
  delete: asyncHandler(async (req, res) => { await moodService.delete(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
  getInsights: asyncHandler(async (req, res) => { const i = await moodService.getInsights(req.user!._id!.toString()); sendSuccess(res, { insights: i }); }),
  getCalendar: asyncHandler(async (req, res) => { const c = await moodService.getCalendar(req.user!._id!.toString(), Number(req.query.year)||new Date().getFullYear(), Number(req.query.month)||new Date().getMonth()+1); sendSuccess(res, { calendar: c }); }),
};
