import { createRemoteJWKSet, jwtVerify, SignJWT } from 'jose';
import { createHash, randomBytes } from 'node:crypto';
import { authSecret } from './session';

/** Google sign-in (OpenID Connect, authorization code flow with PKCE). Credentials come from environment variables. */
export const OAUTH_COOKIE = 'craton_oauth';
const AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export function googleConfig(): { clientId: string; clientSecret: string } | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  return clientId && clientSecret ? { clientId, clientSecret } : null;
}

export const googleEnabled = () => googleConfig() !== null;

const b64url = (b: Buffer) => b.toString('base64url');
const key = () => {
  const s = authSecret();
  if (!s) throw new Error('AUTH_SECRET is not configured');
  return new TextEncoder().encode(`oauth:${s}`);
};

export function redirectUri(origin: string): string {
  return process.env.GOOGLE_REDIRECT_URI?.trim() || `${origin}/api/auth/google/callback`;
}

/** Builds the Google consent URL plus a signed, short-lived cookie that binds state and the PKCE verifier to this browser. */
export async function startGoogle(origin: string) {
  const cfg = googleConfig();
  if (!cfg) throw new Error('Google sign-in is not configured');
  const state = b64url(randomBytes(24));
  const verifier = b64url(randomBytes(48));
  const challenge = b64url(createHash('sha256').update(verifier).digest());
  const cookie = await new SignJWT({ state, verifier }).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('10m').sign(key());
  const url = new URL(AUTH_URL);
  url.search = new URLSearchParams({
    client_id: cfg.clientId,
    redirect_uri: redirectUri(origin),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  }).toString();
  return { url: url.toString(), cookie };
}

export interface GoogleIdentity {
  sub: string;
  email: string;
  emailVerified: boolean;
}

/** Validates state and the PKCE verifier, exchanges the code and verifies the ID token. Throws on any mismatch. */
export async function finishGoogle(origin: string, code: string, state: string, cookie: string | undefined): Promise<GoogleIdentity> {
  const cfg = googleConfig();
  if (!cfg || !cookie) throw new Error('Sign-in session expired');
  const { payload } = await jwtVerify(cookie, key(), { algorithms: ['HS256'] });
  if (payload.state !== state || typeof payload.verifier !== 'string') throw new Error('State mismatch');

  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: cfg.clientId,
      client_secret: cfg.clientSecret,
      redirect_uri: redirectUri(origin),
      grant_type: 'authorization_code',
      code_verifier: payload.verifier,
    }),
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Token exchange failed (${res.status})`);
  const { id_token } = (await res.json()) as { id_token?: string };
  if (!id_token) throw new Error('No ID token returned');

  const { payload: id } = await jwtVerify(id_token, JWKS, { issuer: ['https://accounts.google.com', 'accounts.google.com'], audience: cfg.clientId });
  if (!id.sub || typeof id.email !== 'string') throw new Error('Google did not return an email');
  return { sub: id.sub, email: id.email.trim().toLowerCase(), emailVerified: id.email_verified === true };
}
