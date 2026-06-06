import { asyncHandler } from '../../middleware/asyncHandler'; import { analyticsService } from './analytics.service'; import { sendSuccess } from '../../shared/utils/response';
export const analyticsController = {
  getOverview: asyncHandler(async (req, res) => { const d = await analyticsService.getOverview(req.user!._id!.toString(), req.query); sendSuccess(res, d); }),
  getHabits: asyncHandler(async (req, res) => { const d = await analyticsService.getHabitAnalytics(req.user!._id!.toString(), req.query); sendSuccess(res, d); }),
  getMood: asyncHandler(async (req, res) => { const d = await analyticsService.getMoodAnalytics(req.user!._id!.toString(), req.query); sendSuccess(res, d); }),
  getSleep: asyncHandler(async (req, res) => { const d = await analyticsService.getSleepAnalytics(req.user!._id!.toString(), req.query); sendSuccess(res, d); }),
  getHydration: asyncHandler(async (req, res) => { const d = await analyticsService.getHydrationAnalytics(req.user!._id!.toString(), req.query); sendSuccess(res, d); }),
  getGoals: asyncHandler(async (req, res) => { const d = await analyticsService.getGoalAnalytics(req.user!._id!.toString()); sendSuccess(res, { goals: d }); }),
};
