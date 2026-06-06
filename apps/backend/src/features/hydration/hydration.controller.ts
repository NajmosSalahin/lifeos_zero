import { asyncHandler } from '../../middleware/asyncHandler'; import { hydrationService } from './hydration.service'; import { sendSuccess } from '../../shared/utils/response';
export const hydrationController = {
  create: asyncHandler(async (req, res) => { const l = await hydrationService.create(req.user!._id!.toString(), req.body); sendSuccess(res, { log: l }, 201); }),
  list: asyncHandler(async (req, res) => { const l = await hydrationService.list(req.user!._id!.toString(), req.query); sendSuccess(res, { logs: l }); }),
  getToday: asyncHandler(async (req, res) => { const t = await hydrationService.getToday(req.user!._id!.toString()); sendSuccess(res, t); }),
  delete: asyncHandler(async (req, res) => { await hydrationService.delete(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
  getStats: asyncHandler(async (req, res) => { const s = await hydrationService.getStats(req.user!._id!.toString()); sendSuccess(res, { stats: s }); }),
};
