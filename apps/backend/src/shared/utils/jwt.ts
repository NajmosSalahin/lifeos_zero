import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { UnauthorizedError } from '../errors/AppError';

export interface AccessTokenPayload { sub: string; email: string; role: string; }
export interface RefreshTokenPayload { sub: string; jti: string; }

export const generateAccessToken = (userId: string, email: string, role: string) =>
  jwt.sign({ sub: userId, email, role }, config.JWT_ACCESS_SECRET, { expiresIn: config.JWT_ACCESS_EXPIRES_IN as any });

export const generateRefreshToken = (userId: string, jti: string, rememberMe: boolean) =>
  jwt.sign({ sub: userId, jti }, config.JWT_REFRESH_SECRET, {
    expiresIn: (rememberMe ? `${config.REMEMBER_ME_EXPIRES_DAYS}d` : `${config.SESSION_EXPIRES_DAYS}d`) as any,
  });

export const verifyAccessToken = (token: string): AccessTokenPayload => {
  try { return jwt.verify(token, config.JWT_ACCESS_SECRET) as AccessTokenPayload; }
  catch (e: any) {
    if (e instanceof jwt.TokenExpiredError) throw new UnauthorizedError('Access token expired');
    throw new UnauthorizedError('Invalid access token');
  }
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  try { return jwt.verify(token, config.JWT_REFRESH_SECRET) as RefreshTokenPayload; }
  catch { throw new UnauthorizedError('Invalid or expired refresh token'); }
};
