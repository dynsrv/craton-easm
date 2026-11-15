import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { prisma } from '../db';
import { SESSION_COOKIE, verifySession, type Session } from './session';

/** Session from the cookie, for server components and route handlers. */
export async function getSession(): Promise<Session | null> {
  return verifySession((await cookies()).get(SESSION_COOKIE)?.value);
}

/**
 * Route-handler guard. Middleware already checks the cookie; this also confirms the account
 * still exists, so a deleted user's token stops working immediately.
 */
export async function requireUser(): Promise<{ session: Session } | { response: NextResponse }> {
  const session = await getSession();
  if (!session) return { response: NextResponse.json({ error: 'Sign in required' }, { status: 401 }) };
  const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { id: true } });
  if (!user) return { response: NextResponse.json({ error: 'Sign in required' }, { status: 401 }) };
  return { session };
}
