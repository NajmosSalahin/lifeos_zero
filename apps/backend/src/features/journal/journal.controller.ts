import { asyncHandler } from '../../middleware/asyncHandler'; import { journalService } from './journal.service'; import { sendSuccess, sendPaginated } from '../../shared/utils/response';
export const journalController = {
  create: asyncHandler(async (req, res) => { const e = await journalService.create(req.user!._id!.toString(), req.body); sendSuccess(res, { entry: e }, 201); }),
  list: asyncHandler(async (req, res) => { const { items, total, page, limit } = await journalService.list(req.user!._id!.toString(), req.query); sendPaginated(res, items, total, page, limit); }),
  getOne: asyncHandler(async (req, res) => { const e = await journalService.getOne(req.user!._id!.toString(), req.params.id); sendSuccess(res, { entry: e }); }),
  update: asyncHandler(async (req, res) => { const e = await journalService.update(req.user!._id!.toString(), req.params.id, req.body); sendSuccess(res, { entry: e }); }),
  delete: asyncHandler(async (req, res) => { await journalService.delete(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
  toggleFavorite: asyncHandler(async (req, res) => { const e = await journalService.toggleFavorite(req.user!._id!.toString(), req.params.id); sendSuccess(res, { entry: e }); }),
  search: asyncHandler(async (req, res) => { const r = await journalService.search(req.user!._id!.toString(), String(req.query.q||'')); sendSuccess(res, { results: r }); }),
  getTags: asyncHandler(async (req, res) => { const t = await journalService.getTags(req.user!._id!.toString()); sendSuccess(res, { tags: t }); }),
  getCategories: asyncHandler(async (req, res) => { const c = await journalService.getCategories(req.user!._id!.toString()); sendSuccess(res, { categories: c }); }),
  getStats: asyncHandler(async (req, res) => { const s = await journalService.getStats(req.user!._id!.toString()); sendSuccess(res, { stats: s }); }),
};
