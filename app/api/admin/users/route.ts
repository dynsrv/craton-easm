import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireUser } from '@/lib/auth/guard';
import { generatePassword, hashPassword } from '@/lib/auth/password';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const list = () =>
  prisma.user.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, email: true, role: true, mustChangePassword: true, lastLoginAt: true, createdAt: true },
  });

export async function GET() {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  return NextResponse.json({ users: await list(), me: auth.session.userId });
}

/** POST /api/admin/users { email } -> creates an admin and returns a one-time password (shown once, never stored in clear) */
export async function POST(req: Request) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  const parsed = z.object({ email: z.string().email().max(254) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });

  const email = parsed.data.email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: 'That email already has an account.' }, { status: 409 });

  const password = generatePassword();
  await prisma.user.create({ data: { email, passwordHash: hashPassword(password), role: 'admin', mustChangePassword: true } });
  return NextResponse.json({ users: await list(), created: { email, password } }, { status: 201 });
}

/** DELETE /api/admin/users?id=... */
export async function DELETE(req: Request) {
  const auth = await requireUser();
  if ('response' in auth) return auth.response;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  if (id === auth.session.userId) return NextResponse.json({ error: 'You cannot remove your own account.' }, { status: 400 });
  await prisma.user.deleteMany({ where: { id } });
  return NextResponse.json({ users: await list() });
}
