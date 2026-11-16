/** Roles. "admin" is the website super admin; "user" is a customer who only sees their own scans. */
export const ROLES = ['admin', 'user'] as const;
export type Role = (typeof ROLES)[number];
export const isAdminRole = (role: string | null | undefined) => role === 'admin';

/** Scan-count ceilings for the host cap (what an admin can configure). */
export const DEFAULT_MAX_HOSTS = 200;
export const HOST_CAP_MIN = 10;
export const HOST_CAP_MAX = 500;
export const clampHosts = (n: number) => Math.min(HOST_CAP_MAX, Math.max(HOST_CAP_MIN, Math.round(n)));
