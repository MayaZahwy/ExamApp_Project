import bcrypt from 'bcrypt';
import pool from '../db/connect.js';
import { createError } from '../utils/errors.js';
import { signToken } from '../utils/token.js';

const VALID_ROLES = new Set(['teacher', 'student']);
const BCRYPT_ROUNDS = 10;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function toSafeUser(row) {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
  };
}

function validateRegisterInput({ fullName, email, password, role }) {
  if (!fullName?.trim()) {
    throw createError(400, 'Full name is required.');
  }

  if (!email?.trim()) {
    throw createError(400, 'Email is required.');
  }

  if (!password || password.length < 6) {
    throw createError(400, 'Password must be at least 6 characters.');
  }

  const normalizedRole = role || 'student';

  if (!VALID_ROLES.has(normalizedRole)) {
    throw createError(400, 'Role must be teacher or student.');
  }

  return {
    fullName: fullName.trim(),
    email: normalizeEmail(email),
    password,
    role: normalizedRole,
  };
}

function validateLoginInput({ email, password }) {
  if (!email?.trim()) {
    throw createError(400, 'Email is required.');
  }

  if (!password) {
    throw createError(400, 'Password is required.');
  }

  return {
    email: normalizeEmail(email),
    password,
  };
}

export async function register(input) {
  const { fullName, email, password, role } = validateRegisterInput(input);
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  try {
    const result = await pool.query(
      `INSERT INTO users (full_name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
      [fullName, email, passwordHash, role],
    );

    const user = toSafeUser(result.rows[0]);
    return { token: signToken(user), user };
  } catch (error) {
    if (error.code === '23505') {
      throw createError(409, 'A user with this email already exists.');
    }

    throw error;
  }
}

export async function login(input) {
  const { email, password } = validateLoginInput(input);

  const result = await pool.query(
    `SELECT id, full_name, email, role, password
     FROM users
     WHERE email = $1`,
    [email],
  );

  const row = result.rows[0];

  if (!row) {
    throw createError(401, 'Invalid email or password.');
  }

  const passwordMatches = await bcrypt.compare(password, row.password);

  if (!passwordMatches) {
    throw createError(401, 'Invalid email or password.');
  }

  const user = toSafeUser(row);
  return { token: signToken(user), user };
}
