import { NextResponse } from 'next/server';
import { z } from 'zod';
import { ensureAdmin } from '@/lib/auth/bootstrap';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { authSecret, SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const Body = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) });
const MAX_FAILURES = 5;
const LOCK_MINUTES = 15;
// Verified against when the account does not exist, so response time does not reveal which emails are registered.
const DUMMY_HASH = hashPassword('craton-dummy-password');

export async function POST(req: Request) {
  if (!authSecret()) return NextResponse.json({ error: 'Server is missing AUTH_SECRET. Set it and redeploy.' }, { status: 503 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: 'No database is connected yet. Add DATABASE_URL and redeploy.' }, { status: 503 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
  const email = parsed.data.email.trim().toLowerCase();

  try {
    await ensureAdmin();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      return NextResponse.json({ error: `Too many attempts. Try again in ${LOCK_MINUTES} minutes.` }, { status: 429 });
    }
    const ok = verifyPassword(parsed.data.password, user?.passwordHash ?? DUMMY_HASH) && Boolean(user);
    if (!user || !ok) {
      if (user) {
        const failed = user.failedLogins + 1;
        await prisma.user.update({
          where: { id: user.id },
          data: failed >= MAX_FAILURES ? { failedLogins: 0, lockedUntil: new Date(Date.now() + LOCK_MINUTES * 60_000) } : { failedLogins: failed },
        });
      }
      return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
    }

    await prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() } });
    const token = await signSession({ userId: user.id, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword });
    const res = NextResponse.json({ ok: true, mustChangePassword: user.mustChangePassword });
    res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return res;
  } catch (err) {
    console.error('[craton] login failed', err);
    return NextResponse.json({ error: 'The database is not reachable. Check DATABASE_URL and that the schema was pushed.' }, { status: 503 });
  }
}
