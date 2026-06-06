import rateLimit from 'express-rate-limit';
const make = (windowMs: number, max: number, message: string) =>
  rateLimit({ windowMs, max, message: { success: false, error: { code: 'RATE_LIMIT', message } }, standardHeaders: true, legacyHeaders: false });
export const globalRateLimiter = make(15 * 60 * 1000, 300, 'Too many requests');
export const authRateLimiter = make(15 * 60 * 1000, 15, 'Too many auth attempts');
export const passwordResetLimiter = make(60 * 60 * 1000, 5, 'Too many reset attempts');
