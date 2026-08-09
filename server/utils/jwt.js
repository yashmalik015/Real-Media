// server/utils/jwt.js

import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const ACCESS_TOKEN_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '30d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '90d';
const JWT_SECRET = process.env.JWT_SECRET || 'assetsweber_jwt_secret_key_2045_stable_v1';

/** Sign a JWT access token */
export function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRES_IN });
}

/** Sign a JWT refresh token (to be stored hashed in DB) */
export function signRefreshToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
}

/** Verify a JWT token (access or refresh) */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    console.error('[verifyToken Error]:', err.message);
    return null;
  }
}

/** Hash a refresh token for safe DB storage */
export function hashRefreshToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
