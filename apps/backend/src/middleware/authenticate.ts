import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../shared/utils/jwt';
import { User } from '../models/User.model';
import { UnauthorizedError } from '../shared/errors/AppError';
import { asyncHandler } from './asyncHandler';

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) throw new UnauthorizedError('No access token');
  const token = auth.slice(7);
  const payload = verifyAccessToken(token);
  const user = await User.findById(payload.sub).select('_id email firstName lastName role isEmailVerified preferences hydrationGoal sleepGoal timezone').lean();
  if (!user) throw new UnauthorizedError('User not found');
  req.user = user as any;
  next();
});
