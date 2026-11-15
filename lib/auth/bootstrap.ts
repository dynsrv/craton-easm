import { prisma } from '../db';
import { generatePassword, hashPassword } from './password';

/**
 * First-run setup: when the user table is empty, create the admin named by ADMIN_EMAIL.
 * The password is ADMIN_INITIAL_PASSWORD if set, otherwise a random one printed once to the server log.
 * Either way the admin must choose a new password at first sign-in.
 */
export async function ensureAdmin(): Promise<void> {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!email) return;
  if ((await prisma.user.count()) > 0) return;

  const fromEnv = process.env.ADMIN_INITIAL_PASSWORD;
  const password = fromEnv || generatePassword();
  try {
    await prisma.user.create({ data: { email, passwordHash: hashPassword(password), role: 'admin', mustChangePassword: true } });
    if (!fromEnv) console.log(`[craton] Created admin ${email}. One-time password: ${password}`);
  } catch {
    // another request created it first
  }
}
