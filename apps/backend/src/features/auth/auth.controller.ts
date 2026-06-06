import { Request, Response } from 'express';
import { asyncHandler } from '../../middleware/asyncHandler';
import { authService } from './auth.service';
import { sendSuccess } from '../../shared/utils/response';

export const authController = {
  register: asyncHandler(async (req, res) => { const u = await authService.register(req.body); sendSuccess(res, { user: u }, 201); }),
  login: asyncHandler(async (req, res) => {
    const { accessToken, rawToken, opts, user } = await authService.login(req.body, req.headers['user-agent'] || '', req.ip || '');
    res.cookie('refreshToken', rawToken, opts); sendSuccess(res, { accessToken, user });
  }),
  logout: asyncHandler(async (req, res) => {
    if (req.cookies.refreshToken) await authService.logout(req.cookies.refreshToken);
    res.clearCookie('refreshToken', { path: '/' }); sendSuccess(res, { message: 'Logged out' });
  }),
  logoutAll: asyncHandler(async (req, res) => {
    await authService.logoutAll(req.user!._id!.toString());
    res.clearCookie('refreshToken', { path: '/' }); sendSuccess(res, { message: 'All sessions revoked' });
  }),
  refresh: asyncHandler(async (req, res) => {
    const raw = req.cookies.refreshToken;
    if (!raw) return res.status(401).json({ success: false, error: { code: 'NO_TOKEN', message: 'No refresh token' } });
    const { accessToken, rawToken, opts } = await authService.refresh(raw, req.headers['user-agent'] || '', req.ip || '');
    res.cookie('refreshToken', rawToken, opts); sendSuccess(res, { accessToken });
  }),
  verifyEmail: asyncHandler(async (req, res) => { const u = await authService.verifyEmail(req.body.token); sendSuccess(res, { user: u, message: 'Email verified' }); }),
  resendVerification: asyncHandler(async (req, res) => { await authService.resendVerification(req.user!._id!.toString()); sendSuccess(res, { message: 'Verification email sent' }); }),
  forgotPassword: asyncHandler(async (req, res) => { await authService.forgotPassword(req.body.email); sendSuccess(res, { message: 'Reset link sent if email exists' }); }),
  resetPassword: asyncHandler(async (req, res) => { await authService.resetPassword(req.body.token, req.body.password); sendSuccess(res, { message: 'Password reset. Please log in.' }); }),
  changePassword: asyncHandler(async (req, res) => { await authService.changePassword(req.user!._id!.toString(), req.body.currentPassword, req.body.newPassword); sendSuccess(res, { message: 'Password changed. All sessions revoked.' }); }),
  getSessions: asyncHandler(async (req, res) => { const sessions = await authService.getSessions(req.user!._id!.toString()); sendSuccess(res, { sessions }); }),
  revokeSession: asyncHandler(async (req, res) => { await authService.revokeSession(req.user!._id!.toString(), req.params.id); sendSuccess(res, { message: 'Session revoked' }); }),
};
