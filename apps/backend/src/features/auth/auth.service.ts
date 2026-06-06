import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { addDays, addHours } from 'date-fns';
import { User } from '../../models/User.model';
import { RefreshToken } from '../../models/RefreshToken.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../../shared/utils/jwt';
import { hashToken, generateSecureToken } from '../../shared/utils/crypto';
import { ConflictError, UnauthorizedError, NotFoundError } from '../../shared/errors/AppError';
import { config } from '../../config';

export class AuthService {
  private cookieOpts(rememberMe: boolean) {
    return {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      maxAge: (rememberMe ? config.REMEMBER_ME_EXPIRES_DAYS : config.SESSION_EXPIRES_DAYS) * 86400000,
      path: '/'
    };
  }

  async register(dto: { email: string; password: string; firstName: string; lastName: string }) {
    const existing = await User.findOne({ email: dto.email.toLowerCase() });
    if (existing) throw new ConflictError('Email already registered');
    const user = await User.create({
      email: dto.email,
      passwordHash: dto.password,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isEmailVerified: true,
    });
    return this.sanitize(user);
  }

  async login(dto: { email: string; password: string; rememberMe?: boolean }, userAgent: string, ip: string) {
    const user = await User.findOne({ email: dto.email.toLowerCase() }).select('+passwordHash');
    if (!user) throw new UnauthorizedError('Invalid email or password');
    const valid = await user.comparePassword(dto.password);
    if (!valid) throw new UnauthorizedError('Invalid email or password');
    user.lastLoginAt = new Date();
    user.loginCount += 1;
    await user.save();
    const accessToken = generateAccessToken(user._id.toString(), user.email, user.role);
    const { rawToken, opts } = await this.createRefreshToken(user._id.toString(), dto.rememberMe ?? false, userAgent, ip);
    return { accessToken, rawToken, opts, user: this.sanitize(user) };
  }

  async refresh(rawToken: string, userAgent: string, ip: string) {
    const payload = verifyRefreshToken(rawToken);
    const hashed = hashToken(rawToken);
    const doc = await RefreshToken.findOne({ token: hashed });
    if (!doc) throw new UnauthorizedError('Refresh token not found');
    if (!doc.isActive) {
      await RefreshToken.updateMany({ userId: doc.userId }, { isActive: false, revokedAt: new Date() });
      throw new UnauthorizedError('Token reuse detected — all sessions revoked');
    }
    if (doc.expiresAt < new Date()) throw new UnauthorizedError('Refresh token expired');
    const user = await User.findById(payload.sub).select('_id email role');
    if (!user) throw new UnauthorizedError('User not found');
    doc.isActive = false;
    doc.revokedAt = new Date();
    const { rawToken: newRaw, opts } = await this.createRefreshToken(user._id.toString(), false, userAgent, ip);
    doc.replacedByToken = hashToken(newRaw);
    await doc.save();
    const accessToken = generateAccessToken(user._id.toString(), user.email, user.role);
    return { accessToken, rawToken: newRaw, opts };
  }

  private async createRefreshToken(userId: string, rememberMe: boolean, userAgent: string, ip: string) {
    const jti = uuidv4();
    const rawToken = generateRefreshToken(userId, jti, rememberMe);
    const expiresAt = addDays(new Date(), rememberMe ? config.REMEMBER_ME_EXPIRES_DAYS : config.SESSION_EXPIRES_DAYS);
    await RefreshToken.create({ token: hashToken(rawToken), userId, userAgent, ipAddress: ip, expiresAt });
    return { rawToken, opts: this.cookieOpts(rememberMe) };
  }

  async logout(rawToken: string) {
    await RefreshToken.findOneAndUpdate(
      { token: hashToken(rawToken) },
      { isActive: false, revokedAt: new Date() }
    );
  }

  async logoutAll(userId: string) {
    await RefreshToken.updateMany(
      { userId, isActive: true },
      { isActive: false, revokedAt: new Date() }
    );
  }

  async verifyEmail(token: string) {
    const user = await User.findOne({
      emailVerificationToken: hashToken(token),
      emailVerificationExpires: { $gt: new Date() }
    });
    if (!user) throw new UnauthorizedError('Invalid or expired verification token');
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    return this.sanitize(user);
  }

  async resendVerification(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User');
    if (user.isEmailVerified) return;
    const token = generateSecureToken();
    user.emailVerificationToken = hashToken(token);
    user.emailVerificationExpires = addDays(new Date(), 1);
    await user.save();
  }

  async forgotPassword(email: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return;
    const token = generateSecureToken();
    user.passwordResetToken = hashToken(token);
    user.passwordResetExpires = addHours(new Date(), 1);
    await user.save();
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await User.findOne({
      passwordResetToken: hashToken(token),
      passwordResetExpires: { $gt: new Date() }
    });
    if (!user) throw new UnauthorizedError('Invalid or expired reset token');
    user.passwordHash = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    await this.logoutAll(user._id.toString());
  }

  async changePassword(userId: string, current: string, newPass: string) {
    const user = await User.findById(userId).select('+passwordHash');
    if (!user) throw new NotFoundError('User');
    if (!(await user.comparePassword(current))) throw new UnauthorizedError('Current password incorrect');
    user.passwordHash = newPass;
    await user.save();
    await this.logoutAll(userId);
  }

  async getSessions(userId: string) {
    return RefreshToken.find({ userId, isActive: true, expiresAt: { $gt: new Date() } })
      .select('userAgent ipAddress createdAt expiresAt')
      .sort('-createdAt')
      .lean();
  }

  async revokeSession(userId: string, sessionId: string) {
    const s = await RefreshToken.findById(sessionId);
    if (!s || s.userId.toString() !== userId) throw new NotFoundError('Session');
    s.isActive = false;
    s.revokedAt = new Date();
    await s.save();
  }

  private sanitize(user: any) {
    const obj = user.toObject ? user.toObject() : user;
    const { passwordHash, emailVerificationToken, passwordResetToken, ...safe } = obj;
    return safe;
  }
}

export const authService = new AuthService();