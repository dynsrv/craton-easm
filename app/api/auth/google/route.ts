import { NextResponse, type NextRequest } from 'next/server';
import { googleEnabled, OAUTH_COOKIE, startGoogle } from '@/lib/auth/google';
import { authSecret } from '@/lib/auth/session';

export const runtime = 'nodejs';

/** GET /api/auth/google -> sends the browser to Google's consent screen */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  if (!googleEnabled() || !authSecret()) return NextResponse.redirect(new URL('/login?error=google_off', origin));
  const { url, cookie } = await startGoogle(origin);
  const res = NextResponse.redirect(url);
  res.cookies.set(OAUTH_COOKIE, cookie, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/api/auth/google', maxAge: 600 });
  return res;
}
