import { asyncHandler } from '../../middleware/asyncHandler';
import { usersService } from './users.service';
import { sendSuccess } from '../../shared/utils/response';
export const usersController = {
  getMe: asyncHandler(async (req, res) => { const u = await usersService.getMe(req.user!._id!.toString()); sendSuccess(res, { user: u }); }),
  updateMe: asyncHandler(async (req, res) => { const u = await usersService.updateMe(req.user!._id!.toString(), req.body); sendSuccess(res, { user: u }); }),
  getPreferences: asyncHandler(async (req, res) => { const u = await usersService.getMe(req.user!._id!.toString()); sendSuccess(res, { preferences: u.preferences }); }),
  updatePreferences: asyncHandler(async (req, res) => { const p = await usersService.updatePreferences(req.user!._id!.toString(), req.body); sendSuccess(res, { preferences: p }); }),
  saveDashboard: asyncHandler(async (req, res) => { await usersService.saveDashboardLayout(req.user!._id!.toString(), req.body.layout); sendSuccess(res, { message: 'Layout saved' }); }),
  deleteAccount: asyncHandler(async (req, res) => { await usersService.deleteAccount(req.user!._id!.toString()); res.clearCookie('refreshToken', { path: '/' }); sendSuccess(res, { message: 'Account deleted' }); }),
  getStats: asyncHandler(async (req, res) => { const stats = await usersService.getStats(req.user!._id!.toString()); sendSuccess(res, { stats }); }),
};
