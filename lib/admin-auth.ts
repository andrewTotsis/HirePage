import crypto from 'crypto';

export const ADMIN_COOKIE = 'hp_admin';
const DEFAULT_SECRET = 'hirepage-dev-secret-change-me';

function getSecret(): string {
  return process.env.ADMIN_COOKIE_SECRET || DEFAULT_SECRET;
}

function sign(value: string): string {
  return crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
}

export function issueCookie(): { name: string; value: string; maxAge: number } {
  const iat = Date.now();
  const payload = `v1.${iat}`;
  const sig = sign(payload);
  return { name: ADMIN_COOKIE, value: `${payload}.${sig}`, maxAge: 60 * 60 * 12 };
}

export function verifyCookie(raw: string | undefined | null): boolean {
  if (!raw) return false;
  const parts = raw.split('.');
  if (parts.length !== 3) return false;
  const [ver, iatStr, sig] = parts;
  if (ver !== 'v1') return false;
  const iat = Number(iatStr);
  if (!Number.isFinite(iat)) return false;
  if (Date.now() - iat > 1000 * 60 * 60 * 12) return false;
  const expected = sign(`${ver}.${iatStr}`);
  try {
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function isAdminFromCookies(store: { get(name: string): { value: string } | undefined }): boolean {
  return verifyCookie(store.get(ADMIN_COOKIE)?.value);
}

export function checkPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || 'hirepage-admin';
  if (!input || input.length > 200) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
