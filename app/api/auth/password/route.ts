import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/guard';
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from '@/lib/auth/password';
import { SESSION_COOKIE, sessionCookieOptions, signSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

const Body = z.object({ current: z.string().max(200).optional(), next: z.string().min(MIN_PASSWORD_LENGTH).max(200) });

/** POST /api/auth/password  { current, next }  -> changes the signed-in user's password */
export async function POST(req: Request) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: `The new password needs at least ${MIN_PASSWORD_LENGTH} characters.` }, { status: 400 });
  const { current, next } = parsed.data;

  const user = await prisma.user.findUnique({ where: { id: auth.session.userId } });
  if (!user) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });
  // Accounts created with Google have no password yet, so there is nothing to confirm.
  if (user.passwordHash && !verifyPassword(current ?? '', user.passwordHash)) return NextResponse.json({ error: 'The current password is incorrect.' }, { status: 400 });
  if (current === next) return NextResponse.json({ error: 'Choose a password different from the current one.' }, { status: 400 });

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: hashPassword(next), mustChangePassword: false } });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, await signSession({ ...auth.session, mustChangePassword: false }), sessionCookieOptions);
  return res;
}
