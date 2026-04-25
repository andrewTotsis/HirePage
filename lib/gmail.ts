import { outreachStorage } from './outreach-storage';
import { logEvent } from './outreach';

export type GmailSettings = {
  email: string;
  refresh_token: string;
  access_token?: string;
  expires_at?: number;
  last_history_id?: string;
  last_poll_ms?: number;
  connected_at: number;
};

export const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

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

export async function getProfile(accessToken: string): Promise<{ emailAddress: string; messagesTotal: number; threadsTotal: number; historyId: string }> {
  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!r.ok) throw new Error(`Profile fetch failed: ${r.status}`);
  return (await r.json()) as any;
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

type GmailMessage = { id: string; threadId: string };
type GmailListResponse = { messages?: GmailMessage[]; nextPageToken?: string; resultSizeEstimate?: number };
type GmailHeader = { name: string; value: string };
type GmailFullMessage = { id: string; threadId: string; internalDate?: string; payload?: { headers?: GmailHeader[] }; labelIds?: string[] };

async function listInboxMessages(token: string, query: string, max = 50): Promise<GmailMessage[]> {
  const params = new URLSearchParams({ q: query, maxResults: String(max) });
  const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`messages.list failed: ${r.status}`);
  const j = (await r.json()) as GmailListResponse;
  return j.messages ?? [];
}

async function getMessageMeta(token: string, id: string): Promise<GmailFullMessage> {
  const params = new URLSearchParams({ format: 'metadata', metadataHeaders: 'From,Subject,Date,In-Reply-To,References' });
  const r = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?${params.toString()}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!r.ok) throw new Error(`messages.get failed: ${r.status}`);
  return (await r.json()) as GmailFullMessage;
}

function getHeader(msg: GmailFullMessage, name: string): string {
  const h = msg.payload?.headers?.find((x) => x.name.toLowerCase() === name.toLowerCase());
  return h?.value ?? '';
}

function extractEmail(headerValue: string): string {
  const m = headerValue.match(/<([^>]+)>/);
  if (m) return m[1].trim().toLowerCase();
  return headerValue.trim().toLowerCase();
}

export type ReplyScanResult = {
  scanned: number;
  matched: number;
  replies: Array<{ contact_id: string; email: string; subject: string; thread_id: string }>;
  errors: string[];
};

/**
 * Scan inbox for messages from outreach contacts. Mark them as replied + pause active enrollments.
 * Polls messages newer than `lookbackHours` (default 48).
 */
export async function scanForReplies(lookbackHours = 48): Promise<ReplyScanResult> {
  const result: ReplyScanResult = { scanned: 0, matched: 0, replies: [], errors: [] };
  const settings = await getGmailSettings();
  if (!settings) {
    result.errors.push('Gmail not connected');
    return result;
  }
  const { token, settings: refreshed } = await ensureFreshAccessToken(settings);
  // Build query: in inbox, newer than X hours, not from self
  const sinceMin = Math.floor(lookbackHours * 60);
  const q = `in:inbox newer_than:${Math.max(1, Math.ceil(lookbackHours / 24))}d -from:${refreshed.email}`;
  const list = await listInboxMessages(token, q, 50);
  result.scanned = list.length;
  for (const m of list) {
    try {
      const meta = await getMessageMeta(token, m.id);
      const fromRaw = getHeader(meta, 'From');
      const subject = getHeader(meta, 'Subject');
      const fromEmail = extractEmail(fromRaw);
      if (!fromEmail || fromEmail === refreshed.email) continue;
      const internalMs = Number(meta.internalDate ?? 0);
      // Only count messages received after we connected — don't replay the entire inbox history
      if (internalMs && refreshed.connected_at && internalMs < refreshed.connected_at - 60 * 60 * 1000) continue;
      const contact = await outreachStorage.getContactByEmail(fromEmail);
      if (!contact) continue;

      // Has this message already been logged? Check existing events for this gmail message id
      const existingEvents = await outreachStorage.listEventsByContact(contact.id, 100);
      if (existingEvents.some((e) => e.type === 'replied' && (e.meta as any)?.gmail_id === m.id)) continue;

      // Mark replied + pause/stop active enrollments
      const enrollments = await outreachStorage.listEnrollmentsByContact(contact.id);
      for (const en of enrollments) {
        if (en.status === 'active' || en.status === 'paused') {
          await outreachStorage.putEnrollment({
            ...en,
            status: 'stopped',
            next_send_at: null,
            updated_at: Date.now(),
          });
        }
      }
      const activeEnrollment = enrollments.find((e) => e.status === 'active' || e.status === 'paused' || e.status === 'stopped');
      await logEvent({
        contact_id: contact.id,
        enrollment_id: activeEnrollment?.id ?? null,
        sequence_id: activeEnrollment?.sequence_id ?? null,
        step_idx: activeEnrollment?.current_step ?? null,
        type: 'replied',
        meta: { gmail_id: m.id, gmail_thread: m.threadId, subject, from: fromEmail },
        ts: internalMs || Date.now(),
      });
      result.matched++;
      result.replies.push({ contact_id: contact.id, email: fromEmail, subject, thread_id: m.threadId });
    } catch (e) {
      result.errors.push(e instanceof Error ? e.message : String(e));
    }
  }
  await putGmailSettings({ ...refreshed, last_poll_ms: Date.now() });
  return result;
}
