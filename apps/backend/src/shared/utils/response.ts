import { Response } from 'express';
export const sendSuccess = <T>(res: Response, data: T, statusCode = 200, meta?: object) =>
  res.status(statusCode).json({ success: true, data, ...(meta ? { meta } : {}) });
export const sendPaginated = <T>(res: Response, items: T[], total: number, page: number, limit: number) =>
  res.status(200).json({ success: true, data: items, meta: { total, page, limit, totalPages: Math.ceil(total / limit), hasNextPage: page * limit < total, hasPrevPage: page > 1 } });
