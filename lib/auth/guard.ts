import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '../db';
import { isAdminRole } from './roles';
import { SESSION_COOKIE, verifySession, type Session } from './session';

/** Session from the cookie, for server components and route handlers. */
export async function getSession(): Promise<Session | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/**
 * The signed-in user as stored now, not as the token said at sign-in, so a deleted, disabled or
 * demoted account loses access immediately. Null when there is no valid, enabled account.
 */
export async function currentUser(): Promise<{ session: Session; role: string } | null> {
  const session = await getSession();
  if (!session) return null;
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true, disabled: true } });
  if (!user || user.disabled) return null;
  return { session: { ...session, role: user.role }, role: user.role };
}

const SIGN_IN = () => NextResponse.json({ error: 'Sign in required' }, { status: 401 });

/** Route-handler guard for any signed-in account. */
export async function requireUser(): Promise<{ session: Session } | { response: NextResponse }> {
  const u = await currentUser();
  return u ? { session: u.session } : { response: SIGN_IN() };
}

/** Route-handler guard for super admins only. */
export async function requireAdmin(): Promise<{ session: Session } | { response: NextResponse }> {
  const u = await currentUser();
  if (!u) return { response: SIGN_IN() };
  if (!isAdminRole(u.role)) return { response: NextResponse.json({ error: 'Administrator access required.' }, { status: 403 }) };
  return { session: u.session };
}

/** Prisma `where` fragment limiting scans (and monitors) to what this session may see. Admins see everything. */
export function ownedBy(session: Session): { ownerId?: string } {
  return isAdminRole(session.role) ? {} : { ownerId: session.userId };
}
