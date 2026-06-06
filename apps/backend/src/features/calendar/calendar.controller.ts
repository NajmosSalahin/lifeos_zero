import { asyncHandler } from '../../middleware/asyncHandler'; import { calendarService } from './calendar.service'; import { sendSuccess } from '../../shared/utils/response';
export const calendarController = {
  getMonth: asyncHandler(async (req, res) => { const d = await calendarService.getMonth(req.user!._id!.toString(), Number(req.query.year)||new Date().getFullYear(), Number(req.query.month)||new Date().getMonth()+1); sendSuccess(res, { days: d }); }),
  getDay: asyncHandler(async (req, res) => { const d = await calendarService.getDay(req.user!._id!.toString(), req.params.date); sendSuccess(res, d); }),
};
