import { ErrorRequestHandler } from 'express';
import { AppError } from '../shared/errors/AppError';
import { logger } from '../config/logger';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (!(err instanceof AppError) || !err.isOperational) {
    logger.error('Unhandled error: ' + (err?.message || String(err)) + ' | url: ' + req.url);
  }
  if (err instanceof ZodError) {
    return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: err.flatten().fieldErrors } });
  }
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0] || 'field';
    return res.status(409).json({ success: false, error: { code: 'DUPLICATE_KEY', message: `${field} already exists` } });
  }
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({ success: false, error: { code: err.code, message: err.message, details: err.details } });
  }
  res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } });
};
