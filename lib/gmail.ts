import { outreachStorage } from './outreach-storage';

/**
 * Gmail OAuth + send-via-Gmail-API.
 *
 * Scope: https://www.googleapis.com/auth/gmail.send  (send only — no inbox read)
 * - Send appears in the user's Sent folder
 * - Replies land in their actual inbox naturally (no scanning needed)
 */

export type GmailSettings = {
  email: string;
  refresh_token: string;
  access_token?: string;
  expires_at?: number;
  scope?: string;
  connected_at: number;
};

export const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/userinfo.email',
  'openid',
];

export function getOAuthRedirectUri(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, '')}/api/admin/google/callback`;
}

export function getDefaultBaseUrl(): string {
  if (process.env.OUTREACH_BASE_URL) return process.env.OUTREACH_BASE_URL.replace(/\/+$/, '');
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/+$/, '');
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  return 'https://hirepage.app';
}

export function buildAuthUrl(baseUrl: string, state: string): string {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getOAuthRedirectUri(baseUrl),
    response_type: 'code',
    scope: GMAIL_SCOPES.join(' '),
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state,
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCode(code: string, baseUrl: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope: string;
  token_type: string;
}> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Google OAuth not configured');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getOAuthRedirectUri(baseUrl),
      grant_type: 'authorization_code',
    }).toString(),
  });
  if (!r.ok) throw new Error(`Google token exchange failed: ${r.status} ${await r.text().then((s) => s.slice(0, 200))}`);
  return (await r.json()) as any;
}

export async function refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_in: number }> {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('Google OAuth not configured');
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }).toString(),
  });
  if (!r.ok) throw new Error(`Refresh failed: ${r.status} ${await r.text().then((s) => s.slice(0, 200))}`);
  return (await r.json()) as any;
}

export async function getProfile(accessToken: string): Promise<{ emailAddress: string }> {
  // Use OIDC userinfo — works with the `email` scope and avoids needing a Gmail read scope
  // (gmail.googleapis.com/users/me/profile requires gmail.readonly/metadata/modify, not gmail.send)
  const r = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) throw new Error(`Profile fetch failed: ${r.status} ${await r.text().then((s) => s.slice(0, 200))}`);
  const j = (await r.json()) as { email?: string };
  if (!j.email) throw new Error('Profile fetch returned no email');
  return { emailAddress: j.email };
}

export async function getGmailSettings(): Promise<GmailSettings | null> {
  return await outreachStorage.getSetting<GmailSettings>('gmail');
}

export async function putGmailSettings(s: GmailSettings): Promise<void> {
  await outreachStorage.putSetting('gmail', s as unknown as Record<string, unknown>);
}

export async function disconnectGmail(): Promise<void> {
  await outreachStorage.deleteSetting('gmail');
}

export async function ensureFreshAccessToken(s: GmailSettings): Promise<{ token: string; settings: GmailSettings }> {
  const now = Date.now();
  if (s.access_token && s.expires_at && s.expires_at - 60_000 > now) {
    return { token: s.access_token, settings: s };
  }
  const t = await refreshAccessToken(s.refresh_token);
  const updated: GmailSettings = {
    ...s,
    access_token: t.access_token,
    expires_at: now + t.expires_in * 1000,
  };
  await putGmailSettings(updated);
  return { token: t.access_token, settings: updated };
}

/* ---------------- Send ---------------- */

function base64UrlEncode(s: string): string {
  return Buffer.from(s, 'utf-8').toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function plainToHtml(text: string): string {
  if (/<\s*[a-zA-Z][^>]*>/.test(text)) return text;
  return text
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 12px 0;line-height:1.55;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function encodeSubject(subject: string): string {
  // Gmail accepts UTF-8 subjects via RFC 2047 encoded-word
  if (/^[\x20-\x7E]*$/.test(subject)) return subject;
  return `=?UTF-8?B?${Buffer.from(subject, 'utf-8').toString('base64')}?=`;
}

export type SendInput = {
  toEmail: string;
  toName?: string;
  fromEmail: string;
  fromName?: string;
  subject: string;
  body: string; // plain text or HTML
  replyTo?: string;
  threadId?: string;
};

export type SendResult = {
  ok: boolean;
  message_id?: string;
  thread_id?: string;
  error?: string;
};

export async function sendViaGmail(input: SendInput): Promise<SendResult> {
  const settings = await getGmailSettings();
  if (!settings) return { ok: false, error: 'gmail_not_connected' };
  const { token } = await ensureFreshAccessToken(settings);

  const fromHeader = input.fromName
    ? `${encodeSubject(input.fromName)} <${input.fromEmail}>`
    : input.fromEmail;
  const toHeader = input.toName
    ? `${encodeSubject(input.toName)} <${input.toEmail}>`
    : input.toEmail;

  const html = plainToHtml(input.body);

  const lines = [
    `From: ${fromHeader}`,
    `To: ${toHeader}`,
    `Subject: ${encodeSubject(input.subject)}`,
    input.replyTo ? `Reply-To: ${input.replyTo}` : '',
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 8bit`,
    ``,
    html,
  ].filter(Boolean);
  const raw = base64UrlEncode(lines.join('\r\n'));

  const body: Record<string, string> = { raw };
  if (input.threadId) body.threadId = input.threadId;

  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const errText = await r.text();
    return { ok: false, error: `Gmail ${r.status}: ${errText.slice(0, 240)}` };
  }
  const j = (await r.json()) as { id?: string; threadId?: string };
  return { ok: true, message_id: j.id, thread_id: j.threadId };
}
