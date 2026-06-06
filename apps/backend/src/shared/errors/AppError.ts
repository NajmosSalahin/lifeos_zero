export class AppError extends Error {
  statusCode: number;
  code: string;
  isOperational: boolean;
  details?: unknown;
  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}
export class NotFoundError extends AppError {
  constructor(r = 'Resource') { super(`${r} not found`, 404, 'NOT_FOUND'); }
}
export class UnauthorizedError extends AppError {
  constructor(m = 'Authentication required') { super(m, 401, 'UNAUTHORIZED'); }
}
export class ForbiddenError extends AppError {
  constructor(m = 'Access denied') { super(m, 403, 'FORBIDDEN'); }
}
export class ConflictError extends AppError {
  constructor(m = 'Conflict') { super(m, 409, 'CONFLICT'); }
}
export class ValidationError extends AppError {
  constructor(m: string, d?: unknown) { super(m, 422, 'VALIDATION_ERROR', d); }
}
