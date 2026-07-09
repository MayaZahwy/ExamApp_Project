import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role },
    config.jwtSecret,
    { expiresIn: '7d' },
  );
}
