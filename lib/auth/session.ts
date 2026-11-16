import { jwtVerify, SignJWT } from 'jose';

// No Node-only imports here: middleware runs this on the Edge runtime.
export const SESSION_COOKIE = 'craton_session';
export const SESSION_TTL_SECONDS = 12 * 60 * 60;

export interface Session {
  userId: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
}

export function authSecret(): string | null {
  const s = process.env.AUTH_SECRET;
  if (s && s.length >= 32) return s;
  // Convenience for `npm run dev` only. Production refuses to issue sessions without AUTH_SECRET.
  return process.env.NODE_ENV === 'production' ? null : 'dev-only-secret-do-not-use-in-production-0000';
}

const key = (secret: string) => new TextEncoder().encode(secret);

export async function signSession(session: Session): Promise<string> {
  const secret = authSecret();
  if (!secret) throw new Error('AUTH_SECRET is not configured');
  return new SignJWT({ email: session.email, role: session.role, mcp: session.mustChangePassword })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(key(secret));
}

export async function verifySession(token: string | undefined): Promise<Session | null> {
  const secret = authSecret();
  if (!token || !secret) return null;
  try {
    const { payload } = await jwtVerify(token, key(secret), { algorithms: ['HS256'] });
    if (!payload.sub || typeof payload.email !== 'string') return null;
    return { userId: payload.sub, email: payload.email, role: String(payload.role ?? 'user'), mustChangePassword: payload.mcp === true };
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
  maxAge: SESSION_TTL_SECONDS,
};
