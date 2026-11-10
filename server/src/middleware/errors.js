import { HttpError } from '../utils/httpError.js';
import { config } from '../config/env.js';

export function notFound(_req, _res, next) {
  next(new HttpError(404, 'The requested resource was not found.'));
}

export function errorHandler(error, _req, res, _next) {
  const status = error.statusCode || (error.name === 'ValidationError' ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({
    success: false,
    message: status >= 500 && config.isProduction ? 'An unexpected server error occurred.' : error.message,
    ...(error.name === 'ValidationError' && { errors: Object.values(error.errors).map(({ message }) => message) })
  });
}
