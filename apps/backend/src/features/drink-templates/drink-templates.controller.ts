import { asyncHandler } from '../../middleware/asyncHandler'; import { drinkTemplatesService } from './drink-templates.service'; import { sendSuccess } from '../../shared/utils/response';
export const drinkTemplatesController = {
  list: asyncHandler(async (req, res) => { const t = await drinkTemplatesService.list(req.user!._id!.toString()); sendSuccess(res, { templates: t }); }),
  create: asyncHandler(async (req, res) => { const t = await drinkTemplatesService.create(req.user!._id!.toString(), req.body); sendSuccess(res, { template: t }, 201); }),
  update: asyncHandler(async (req, res) => { const t = await drinkTemplatesService.update(req.user!._id!.toString(), req.params.id, req.body); sendSuccess(res, { template: t }); }),
  delete: asyncHandler(async (req, res) => { await drinkTemplatesService.delete(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Deleted' }); }),
};
