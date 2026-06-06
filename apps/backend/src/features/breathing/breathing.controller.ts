import { asyncHandler } from '../../middleware/asyncHandler'; import { breathingService } from './breathing.service'; import { sendSuccess, sendPaginated } from '../../shared/utils/response';
export const breathingController = {
  listTechniques: asyncHandler(async (req, res) => { const t = await breathingService.listTechniques(req.user!._id!.toString()); sendSuccess(res, { techniques: t }); }),
  createTechnique: asyncHandler(async (req, res) => { const t = await breathingService.createTechnique(req.user!._id!.toString(), req.body); sendSuccess(res, { technique: t }, 201); }),
  updateTechnique: asyncHandler(async (req, res) => { const t = await breathingService.updateTechnique(req.user!._id!.toString(), req.params.id, req.body); sendSuccess(res, { technique: t }); }),
  deleteTechnique: asyncHandler(async (req, res) => { await breathingService.deleteTechnique(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
  createSession: asyncHandler(async (req, res) => { const s = await breathingService.createSession(req.user!._id!.toString(), req.body); sendSuccess(res, { session: s }, 201); }),
  listSessions: asyncHandler(async (req, res) => { const { items, total, page, limit } = await breathingService.listSessions(req.user!._id!.toString(), req.query); sendPaginated(res, items, total, page, limit); }),
  getSessionStats: asyncHandler(async (req, res) => { const s = await breathingService.getSessionStats(req.user!._id!.toString()); sendSuccess(res, { stats: s }); }),
  deleteSession: asyncHandler(async (req, res) => { await breathingService.deleteSession(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
};
