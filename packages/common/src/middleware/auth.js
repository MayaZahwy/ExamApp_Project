import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { createError } from '../utils/errors.js';

export function authenticate(req, res, next) {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    next(createError(401, 'Authentication required.'));
    return;
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch {
    next(createError(401, 'Invalid or expired token.'));
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(createError(403, 'Forbidden.'));
      return;
    }

    next();
  };
}
