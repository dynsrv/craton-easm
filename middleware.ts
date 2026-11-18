import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from '@/lib/auth/session';

// /api/cron/* authenticates with CRON_SECRET inside the route instead of a session.
const PUBLIC = ['/login', '/compliance', '/api/ping', '/robots.txt', '/sitemap.xml', '/manifest.webmanifest', '/opengraph-image', '/api/auth/login', '/api/auth/google', '/api/auth/google/callback', '/api/cron/monitor', '/api/cron/selftest'];

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

  // /compliance is static for visitors; people holding a session cookie get the in-app variant.
  if (pathname === '/compliance') {
    if (!req.cookies.get(SESSION_COOKIE)?.value) return NextResponse.next();
    const url = req.nextUrl.clone();
    url.pathname = '/compliance/app';
    return NextResponse.rewrite(url);
  }
  if (pathname === '/compliance/app') return NextResponse.redirect(new URL('/compliance', req.url));

  if (pathname === '/welcome') return NextResponse.redirect(new URL('/', req.url));

  // The sign-in page is prerendered; people who already have a session are sent on from here.
  if (pathname === '/login') {
    if (await verifySession(req.cookies.get(SESSION_COOKIE)?.value)) return NextResponse.redirect(new URL('/', req.url));
    return NextResponse.next();
  }

  // The legal pages must be readable by anyone, signed in or not.
  if (pathname === '/legal' || pathname.startsWith('/legal/')) return NextResponse.next();
  if (PUBLIC.some((p) => pathname === p)) return NextResponse.next();

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  // The home page is the public landing page until someone signs in. Visitors get the prerendered copy
  // from the edge cache; only signed-in people reach the dynamic dashboard.
  if (!session && pathname === '/') {
    const url = req.nextUrl.clone();
    url.pathname = '/welcome';
    return NextResponse.rewrite(url);
  }
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
