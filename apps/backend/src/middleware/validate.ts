import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
type Part = 'body' | 'query' | 'params';
export const validate = (schema: AnyZodObject, part: Part = 'body') =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      (req as any)[part] = await schema.parseAsync((req as any)[part]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: err.flatten().fieldErrors } });
      }
      next(err);
    }
  };
