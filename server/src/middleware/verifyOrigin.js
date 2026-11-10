import { config } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);
const allowedOrigin = new URL(config.clientUrl).origin;

export function verifyOrigin(req, _res, next) {
  const origin = req.get('origin');
  if (safeMethods.has(req.method) || !origin) return next();
  let requestOrigin;
  try {
    requestOrigin = new URL(origin).origin;
  } catch {
    return next(new HttpError(403, 'Request origin is not allowed.'));
  }
  if (requestOrigin !== allowedOrigin) return next(new HttpError(403, 'Request origin is not allowed.'));
  next();
}
