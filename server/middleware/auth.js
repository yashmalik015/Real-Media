import jwt from 'jsonwebtoken';
import { verifyIdToken } from '../firebaseAdmin.js';
import { verifyToken } from '../utils/jwt.js';

/** Verify JWT from Authorization header */
export function verifyJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'Missing Authorization header.' });
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
  // Attach decoded payload (contains sub, id, role, email)
  req.user = { id: payload.sub || payload.id, ...payload };
  return next();
}

/** Role based access middleware */
export function requireRoles(...allowedRoles) {
  const set = new Set(allowedRoles);
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
    if (!set.has(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions.' });
    }
    return next();
  };
}

/** Firebase ID token exchange for JWT access + refresh tokens */
export async function firebaseLoginHandler(req, res) {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: 'Firebase ID token required.' });
  try {
    const firebaseUser = await verifyIdToken(idToken);
    // This handler is no longer self-contained — callers should use createAuthResponse
    // from index.js instead. Keep basic fallback for backward compat.
    const payload = { sub: firebaseUser.uid, email: firebaseUser.email };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    return res.json({ accessToken: token, user: { uid: firebaseUser.uid, email: firebaseUser.email, name: firebaseUser.name } });
  } catch (err) {
    console.error('[Firebase Login] error:', err.message);
    return res.status(401).json({ message: 'Invalid Firebase token.' });
  }
}
