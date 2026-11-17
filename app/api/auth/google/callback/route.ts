import { NextResponse, type NextRequest } from 'next/server';
import { finishGoogle, OAUTH_COOKIE } from '@/lib/auth/google';
import { ensureAdmin } from '@/lib/auth/bootstrap';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

/** GET /api/auth/google/callback -> signs in or signs up the Google account, then opens the app */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const fail = (code: string) => {
    const res = NextResponse.redirect(new URL(`/login?error=${code}`, origin));
    res.cookies.delete({ name: OAUTH_COOKIE, path: '/api/auth/google' });
    return res;
  };

  const q = req.nextUrl.searchParams;
  if (q.get('error')) return fail('google_denied');
  const code = q.get('code');
  const state = q.get('state');
  if (!code || !state) return fail('google_failed');

  try {
    const g = await finishGoogle(origin, code, state, req.cookies.get(OAUTH_COOKIE)?.value);
    if (!g.emailVerified) return fail('google_unverified');

    await ensureAdmin();
    let user = await prisma.user.findUnique({ where: { googleSub: g.sub } });
    if (!user) {
      const byEmail = await prisma.user.findUnique({ where: { email: g.email } });
      if (byEmail) {
        // Same verified email: link Google to the existing account. Refuse if it is already linked to a different Google account.
        if (byEmail.googleSub && byEmail.googleSub !== g.sub) return fail('google_failed');
        user = await prisma.user.update({ where: { id: byEmail.id }, data: { googleSub: g.sub } });
      } else {
        // Open sign-up: a verified Google email is enough to create a customer account.
        user = await prisma.user.create({ data: { email: g.email, googleSub: g.sub, role: 'user', mustChangePassword: false } });
      }
    }
    if (user.disabled) return fail('disabled');

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), failedLogins: 0, lockedUntil: null } });
    const token = await signSession({ userId: user.id, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword });
    const res = NextResponse.redirect(new URL(user.mustChangePassword ? '/change-password' : '/', origin));
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    res.cookies.delete({ name: OAUTH_COOKIE, path: '/api/auth/google' });
    return res;
  } catch (err) {
    console.error('[craton] google sign-in failed', err);
    return fail('google_failed');
  }
}
