import { asyncHandler } from '../../middleware/asyncHandler'; import { sleepService } from './sleep.service'; import { sendSuccess, sendPaginated } from '../../shared/utils/response';
export const sleepController = {
  create: asyncHandler(async (req, res) => { const s = await sleepService.create(req.user!._id!.toString(), req.body); sendSuccess(res, { sleep: s }, 201); }),
  list: asyncHandler(async (req, res) => { const { items, total, page, limit } = await sleepService.list(req.user!._id!.toString(), req.query); sendPaginated(res, items, total, page, limit); }),
  update: asyncHandler(async (req, res) => { const s = await sleepService.update(req.user!._id!.toString(), req.params.id, req.body); sendSuccess(res, { sleep: s }); }),
  delete: asyncHandler(async (req, res) => { await sleepService.delete(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
  getStats: asyncHandler(async (req, res) => { const s = await sleepService.getStats(req.user!._id!.toString()); sendSuccess(res, { stats: s }); }),
};
