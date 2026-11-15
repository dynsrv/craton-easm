import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth/session';

// /api/cron/* authenticates with CRON_SECRET inside the route instead of a session.
const PUBLIC = ['/login', '/api/auth/login', '/api/cron/monitor'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApi = pathname.startsWith('/api/');

  // CSRF: state-changing API calls must come from this origin.
  if (isApi && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    const origin = req.headers.get('origin');
    if (origin && new URL(origin).host !== req.headers.get('host')) {
      return NextResponse.json({ error: 'Cross-origin request blocked' }, { status: 403 });
    }
  }

  if (PUBLIC.some((p) => pathname === p)) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    if (isApi) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    return NextResponse.redirect(url);
  }

  // A one-time password only unlocks the change-password screen.
  if (session.mustChangePassword && pathname !== '/change-password' && !pathname.startsWith('/api/auth/')) {
    if (isApi) return NextResponse.json({ error: 'Change your password first' }, { status: 403 });
    const url = req.nextUrl.clone();
    url.pathname = '/change-password';
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|ico|woff2?)$).*)'],
};
