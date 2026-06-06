import { asyncHandler } from '../../middleware/asyncHandler';
import { habitsService } from './habits.service';
import { sendSuccess } from '../../shared/utils/response';
export const habitsController = {
  list: asyncHandler(async (req, res) => { const h = await habitsService.list(req.user!._id!.toString(), req.query); sendSuccess(res, { habits: h }); }),
  create: asyncHandler(async (req, res) => { const h = await habitsService.create(req.user!._id!.toString(), req.body); sendSuccess(res, { habit: h }, 201); }),
  getOne: asyncHandler(async (req, res) => { const h = await habitsService.getOne(req.user!._id!.toString(), req.params.id); sendSuccess(res, { habit: h }); }),
  update: asyncHandler(async (req, res) => { const h = await habitsService.update(req.user!._id!.toString(), req.params.id, req.body); sendSuccess(res, { habit: h }); }),
  archive: asyncHandler(async (req, res) => { const h = await habitsService.archive(req.user!._id!.toString(), req.params.id, req.body.archive ?? true); sendSuccess(res, { habit: h }); }),
  delete: asyncHandler(async (req, res) => { await habitsService.delete(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
  reorder: asyncHandler(async (req, res) => { await habitsService.reorder(req.user!._id!.toString(), req.body.items); sendSuccess(res, { message: 'Reordered' }); }),
  log: asyncHandler(async (req, res) => { const l = await habitsService.log(req.user!._id!.toString(), req.params.id, new Date(req.body.date), req.body.count ?? 1, req.body.note); sendSuccess(res, { log: l }); }),
  getLogs: asyncHandler(async (req, res) => { const l = await habitsService.getLogs(req.user!._id!.toString(), req.query); sendSuccess(res, { logs: l }); }),
  getToday: asyncHandler(async (req, res) => { const t = await habitsService.getToday(req.user!._id!.toString()); sendSuccess(res, { today: t }); }),
  getStreak: asyncHandler(async (req, res) => { const s = await habitsService.getStreak(req.user!._id!.toString(), req.params.id); sendSuccess(res, s); }),
  getStats: asyncHandler(async (req, res) => { const s = await habitsService.getStats(req.user!._id!.toString(), req.params.id, Number(req.query.days) || 30); sendSuccess(res, s); }),
  getCalendar: asyncHandler(async (req, res) => { const c = await habitsService.getCalendar(req.user!._id!.toString(), req.params.id, Number(req.query.year) || new Date().getFullYear()); sendSuccess(res, { calendar: c }); }),
};
