import { Contact } from './outreach-storage';
import { fullName } from './outreach';

const RESEND_API = 'https://api.resend.com/emails';

export type SendResult = {
  draft: boolean; // true when no Resend API key — pretended as sent for tracking
  providerId?: string;
};

export type SendInput = {
  contact: Contact;
  enrollmentId: string;
  sequenceId: string;
  stepIdx: number;
  subject: string;
  body: string;
  baseUrl?: string;
};

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export function fromAddress(): string {
  const fromEmail = process.env.OUTREACH_FROM_EMAIL || 'support@hirepage.app';
  const fromName = process.env.OUTREACH_FROM_NAME || 'HirePage';
  return `${fromName} <${fromEmail}>`;
}

export function getBaseUrl(reqUrl?: string): string {
  if (process.env.OUTREACH_BASE_URL) return stripTrailing(process.env.OUTREACH_BASE_URL);
  if (process.env.NEXT_PUBLIC_BASE_URL) return stripTrailing(process.env.NEXT_PUBLIC_BASE_URL);
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (reqUrl) {
    try { const u = new URL(reqUrl); return `${u.protocol}//${u.host}`; } catch {}
  }
  return 'https://hirepage.app';
}

function stripTrailing(s: string): string { return s.replace(/\/+$/, ''); }

/**
 * Render the body as HTML: convert plain text -> paragraphs (if not already HTML),
 * inject open-tracking pixel, rewrite links to click-tracker, and append unsubscribe footer.
 */
function renderHtml({
  body,
  trackingId,
  unsubUrl,
  baseUrl,
}: { body: string; trackingId: string; unsubUrl: string; baseUrl: string }): string {
  const isHtml = /<\s*[a-zA-Z][^>]*>/.test(body);
  const html = isHtml
    ? body
    : body
        .split(/\n{2,}/)
        .map((p) => `<p style="margin:0 0 14px 0;line-height:1.55;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
        .join('');

  // Rewrite links to click-tracker
  const rewritten = html.replace(
    /<a\s+([^>]*?)href=(["'])(.*?)\2([^>]*)>/gi,
    (m, pre, q, url, post) => {
      if (!url || url.startsWith('#') || url.startsWith('mailto:')) return m;
      const target = `${baseUrl}/api/track/click/${trackingId}?u=${encodeURIComponent(url)}`;
      return `<a ${pre}href=${q}${target}${q}${post}>`;
    },
  );

  const pixel = `<img src="${baseUrl}/api/track/open/${trackingId}" alt="" width="1" height="1" style="display:block;border:0;outline:none;" />`;
  const footer = `
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:11px;color:#888;line-height:1.5;margin:0;">
      You can <a href="${unsubUrl}" style="color:#888;text-decoration:underline;">unsubscribe</a> at any time.
    </p>`;

  return `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#0a0a0b;font-size:15px;line-height:1.55;">${rewritten}${footer}${pixel}</div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export async function sendOutreachEmail(input: SendInput): Promise<SendResult> {
  const { contact, enrollmentId, stepIdx, subject, body } = input;
  const baseUrl = input.baseUrl || getBaseUrl();
  const trackingId = `${enrollmentId}_${stepIdx}`;
  const unsubUrl = `${baseUrl}/unsubscribe?t=${encodeURIComponent(contact.unsub_token)}`;
  const html = renderHtml({ body, trackingId, unsubUrl, baseUrl });
  const apiKey = process.env.RESEND_API_KEY;
  const replyTo = process.env.OUTREACH_REPLY_TO || undefined;
  if (!apiKey) {
    return { draft: true };
  }
  const res = await fetch(RESEND_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [contact.email],
      subject,
      html,
      reply_to: replyTo,
      headers: {
        'List-Unsubscribe': `<${unsubUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
      },
      tags: [
        { name: 'enrollment_id', value: enrollmentId },
        { name: 'step', value: String(stepIdx) },
      ],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend ${res.status}: ${text.slice(0, 240)}`);
  }
  const j = (await res.json()) as { id?: string };
  return { draft: false, providerId: j.id };
}

/**
 * 1×1 transparent GIF for tracking pixel responses.
 */
export const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
);

export function pixelHeaders(): Record<string, string> {
  return {
    'Content-Type': 'image/gif',
    'Content-Length': String(PIXEL_GIF.length),
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  };
}

export function describeContact(c: Contact): string {
  return [fullName(c), c.email].filter(Boolean).join(' — ');
}
