import { asyncHandler } from '../../middleware/asyncHandler'; import { goalsService } from './goals.service'; import { sendSuccess } from '../../shared/utils/response';
export const goalsController = {
  list: asyncHandler(async (req, res) => { const g = await goalsService.list(req.user!._id!.toString(), req.query); sendSuccess(res, { goals: g }); }),
  create: asyncHandler(async (req, res) => { const g = await goalsService.create(req.user!._id!.toString(), req.body); sendSuccess(res, { goal: g }, 201); }),
  getOne: asyncHandler(async (req, res) => { const g = await goalsService.getOne(req.user!._id!.toString(), req.params.id); sendSuccess(res, { goal: g }); }),
  update: asyncHandler(async (req, res) => { const g = await goalsService.update(req.user!._id!.toString(), req.params.id, req.body); sendSuccess(res, { goal: g }); }),
  delete: asyncHandler(async (req, res) => { await goalsService.delete(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
  updateProgress: asyncHandler(async (req, res) => { const g = await goalsService.updateProgress(req.user!._id!.toString(), req.params.id, req.body.currentValue); sendSuccess(res, { goal: g }); }),
  complete: asyncHandler(async (req, res) => { const g = await goalsService.complete(req.user!._id!.toString(), req.params.id); sendSuccess(res, { goal: g }); }),
  addMilestone: asyncHandler(async (req, res) => { const g = await goalsService.addMilestone(req.user!._id!.toString(), req.params.id, req.body); sendSuccess(res, { goal: g }, 201); }),
  updateMilestone: asyncHandler(async (req, res) => { const g = await goalsService.updateMilestone(req.user!._id!.toString(), req.params.id, req.params.mid, req.body); sendSuccess(res, { goal: g }); }),
  deleteMilestone: asyncHandler(async (req, res) => { const g = await goalsService.deleteMilestone(req.user!._id!.toString(), req.params.id, req.params.mid); sendSuccess(res, { goal: g }); }),
  completeMilestone: asyncHandler(async (req, res) => { const g = await goalsService.completeMilestone(req.user!._id!.toString(), req.params.id, req.params.mid); sendSuccess(res, { goal: g }); }),
};
