import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth/guard';
import { generatePassword, hashPassword } from '@/lib/auth/password';
import { HOST_CAP_MAX, HOST_CAP_MIN, ROLES } from '@/lib/auth/roles';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const list = async () => {
  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, email: true, role: true, maxHosts: true, disabled: true, mustChangePassword: true, lastLoginAt: true, createdAt: true },
    }),
    prisma.scan.groupBy({ by: ['ownerId'], _count: { _all: true } }),
  ]);
  const scans = new Map(counts.map((c) => [c.ownerId, c._count._all]));
  return users.map((u) => ({ ...u, scans: scans.get(u.id) ?? 0 }));
};

const Hosts = z.number().int().min(HOST_CAP_MIN).max(HOST_CAP_MAX).nullable();
const Role = z.enum(ROLES);

export async function GET() {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;
  return NextResponse.json({ users: await list(), me: auth.session.userId });
}

/** POST /api/admin/users { email, role, maxHosts? } -> creates an account and returns a one-time password (shown once) */
export async function POST(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;
  const parsed = z.object({ email: z.string().email().max(254), role: Role.default('user'), maxHosts: Hosts.optional() }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email address and a host limit between 10 and 500.' }, { status: 400 });

  const email = parsed.data.email.trim().toLowerCase();
  if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: 'That email already has an account.' }, { status: 409 });

  const password = generatePassword();
  await prisma.user.create({
    data: { email, passwordHash: hashPassword(password), role: parsed.data.role, maxHosts: parsed.data.maxHosts ?? null, mustChangePassword: true },
  });
  return NextResponse.json({ users: await list(), created: { email, password } }, { status: 201 });
}

/** True when changing this account would leave no enabled super admin. */
async function wouldOrphanAdmins(id: string): Promise<boolean> {
  return (await prisma.user.count({ where: { role: 'admin', disabled: false, NOT: { id } } })) === 0;
}

/**
 * PATCH /api/admin/users { id, role?, maxHosts?, disabled?, resetPassword? }
 * Changes role, host limit or status, or issues a new one-time password.
 */
export async function PATCH(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;
  const parsed = z
    .object({ id: z.string().min(1), role: Role.optional(), maxHosts: Hosts.optional(), disabled: z.boolean().optional(), resetPassword: z.boolean().optional() })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Invalid change.' }, { status: 400 });
  const { id, role, maxHosts, disabled, resetPassword } = parsed.data;

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  const isSelf = id === auth.session.userId;
  if (isSelf && ((role && role !== 'admin') || disabled)) return NextResponse.json({ error: 'You cannot demote or disable your own account.' }, { status: 400 });
  const losesAdmin = target.role === 'admin' && ((role && role !== 'admin') || disabled === true);
  if (losesAdmin && (await wouldOrphanAdmins(id))) return NextResponse.json({ error: 'There must be at least one enabled super admin.' }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (role !== undefined) data.role = role;
  if (maxHosts !== undefined) data.maxHosts = maxHosts;
  if (disabled !== undefined) data.disabled = disabled;
  let password: string | undefined;
  if (resetPassword) {
    password = generatePassword();
    Object.assign(data, { passwordHash: hashPassword(password), mustChangePassword: true, failedLogins: 0, lockedUntil: null });
  }
  if (Object.keys(data).length) await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ users: await list(), ...(password ? { created: { email: target.email, password, reset: true } } : {}) });
}

/** DELETE /api/admin/users?id=... (the user's scans stay, visible to admins) */
export async function DELETE(req: Request) {
  const auth = await requireAdmin();
  if ('response' in auth) return auth.response;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id.' }, { status: 400 });
  if (id === auth.session.userId) return NextResponse.json({ error: 'You cannot remove your own account.' }, { status: 400 });
  const target = await prisma.user.findUnique({ where: { id } });
  if (target?.role === 'admin' && (await wouldOrphanAdmins(id))) return NextResponse.json({ error: 'There must be at least one enabled super admin.' }, { status: 400 });
  await prisma.user.deleteMany({ where: { id } });
  return NextResponse.json({ users: await list() });
}
