import {
  ActivityEvent,
  Contact,
  EventType,
  outreachStorage,
} from './outreach-storage';

export function newId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {}
  return 'id_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function newToken(): string {
  let s = '';
  for (let i = 0; i < 4; i++) s += Math.random().toString(36).slice(2, 10);
  return s.slice(0, 32);
}

/* ---------------- Personalization ---------------- */

export function personalize(template: string, contact: Contact, extras: Record<string, string> = {}): string {
  if (!template) return '';
  const map: Record<string, string> = {
    first_name: contact.first_name || namePart(contact, 0) || 'there',
    last_name: contact.last_name || namePart(contact, 1) || '',
    full_name: fullName(contact) || 'there',
    email: contact.email || '',
    company: contact.company || '',
    title: contact.title || '',
    linkedin: contact.linkedin || '',
    ...extras,
    ...Object.fromEntries(Object.entries(contact.custom || {})),
  };
  return template.replace(/\{\{\s*([a-z0-9_]+)\s*\}\}/gi, (_, k) => {
    const key = String(k).toLowerCase();
    return map[key] ?? '';
  });
}

function namePart(c: Contact, idx: 0 | 1): string {
  const name = (c.first_name || c.last_name || c.email.split('@')[0] || '').trim();
  if (!name) return '';
  const parts = name.split(/\s+/);
  return parts[idx] ?? '';
}

export function fullName(c: Contact): string {
  return [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
}

/* ---------------- Contacts ---------------- */

export type ContactImportRow = Partial<{
  email: string;
  first_name: string;
  last_name: string;
  linkedin: string;
  company: string;
  title: string;
  tags: string[];
}>;

export async function createContact(input: ContactImportRow & { source?: string }): Promise<Contact> {
  const now = Date.now();
  const email = (input.email || '').trim();
  const c: Contact = {
    id: newId(),
    email,
    first_name: (input.first_name || '').trim(),
    last_name: (input.last_name || '').trim(),
    linkedin: (input.linkedin || '').trim(),
    company: (input.company || '').trim(),
    title: (input.title || '').trim(),
    tags: input.tags ?? [],
    custom: {},
    source: input.source || 'manual',
    unsubscribed: false,
    bounced: false,
    notes: '',
    unsub_token: newToken(),
    created_at: now,
    updated_at: now,
  };
  await outreachStorage.putContact(c);
  return c;
}

export async function upsertContactByEmail(input: ContactImportRow & { source?: string }): Promise<{ contact: Contact; created: boolean }> {
  const email = (input.email || '').trim();
  if (email) {
    const existing = await outreachStorage.getContactByEmail(email);
    if (existing) {
      const merged = await outreachStorage.patchContact(existing.id, {
        first_name: input.first_name?.trim() || existing.first_name,
        last_name: input.last_name?.trim() || existing.last_name,
        linkedin: input.linkedin?.trim() || existing.linkedin,
        company: input.company?.trim() || existing.company,
        title: input.title?.trim() || existing.title,
        tags: mergeTags(existing.tags, input.tags ?? []),
      });
      return { contact: merged!, created: false };
    }
  }
  const c = await createContact(input);
  return { contact: c, created: true };
}

function mergeTags(a: string[], b: string[]): string[] {
  const set = new Set([...a.map((t) => t.trim()).filter(Boolean), ...b.map((t) => t.trim()).filter(Boolean)]);
  return Array.from(set);
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_RE = /(?:https?:\/\/)?(?:[a-z]{2,3}\.)?linkedin\.com\/(?:in|pub|company)\/[a-z0-9_\-/.%]+/i;

export function isEmail(v: string): boolean { return EMAIL_RE.test(v.trim()); }
export function isLinkedIn(v: string): boolean { return LINKEDIN_RE.test(v.trim()); }

export function parseBulkInput(raw: string): ContactImportRow[] {
  const text = raw.replace(/\r\n?/g, '\n').trim();
  if (!text) return [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  const looksCsv = lines[0].includes(',') || lines[0].includes('\t');
  if (looksCsv) {
    const sep = lines[0].includes('\t') ? '\t' : ',';
    const headerRaw = lines[0].split(sep).map((h) => h.trim().toLowerCase());
    const hasHeader = headerRaw.some((h) =>
      ['email', 'firstname', 'first_name', 'first name', 'last_name', 'lastname', 'last name', 'linkedin', 'company', 'title', 'name'].includes(h),
    );
    const cols = hasHeader ? headerRaw : headerRaw.map((_, i) => `col${i}`);
    const rows = (hasHeader ? lines.slice(1) : lines).map((l) => l.split(sep).map((c) => c.trim()));
    return rows.map((cells) => buildRow(cells, cols));
  }

  return lines.map((line) => {
    const out: ContactImportRow = {};
    if (isEmail(line)) out.email = line;
    else if (isLinkedIn(line)) out.linkedin = line.startsWith('http') ? line : `https://${line}`;
    else {
      const m = line.match(EMAIL_RE);
      const lm = line.match(LINKEDIN_RE);
      if (m) out.email = m[0];
      if (lm) out.linkedin = lm[0].startsWith('http') ? lm[0] : `https://${lm[0]}`;
      if (!m && !lm) out.first_name = line;
    }
    return out;
  });
}

function buildRow(cells: string[], cols: string[]): ContactImportRow {
  const out: ContactImportRow = {};
  for (let i = 0; i < cells.length && i < cols.length; i++) {
    const v = cells[i];
    if (!v) continue;
    const k = cols[i];
    if (['email', 'e-mail', 'mail'].includes(k)) out.email = v;
    else if (['first_name', 'firstname', 'first name', 'first'].includes(k)) out.first_name = v;
    else if (['last_name', 'lastname', 'last name', 'last'].includes(k)) out.last_name = v;
    else if (k === 'linkedin' || k === 'profile') out.linkedin = v.startsWith('http') ? v : `https://${v}`;
    else if (k === 'company' || k === 'organization' || k === 'org') out.company = v;
    else if (k === 'title' || k === 'role' || k === 'position') out.title = v;
    else if (k === 'name' || k === 'full name' || k === 'full_name') {
      const parts = v.split(/\s+/);
      out.first_name = out.first_name || parts[0];
      if (parts.length > 1) out.last_name = out.last_name || parts.slice(1).join(' ');
    } else if (!out.email && isEmail(v)) out.email = v;
    else if (!out.linkedin && isLinkedIn(v)) out.linkedin = v.startsWith('http') ? v : `https://${v}`;
  }
  return out;
}

export type ImportSummary = {
  added: number;
  updated: number;
  skipped: number;
  invalid: number;
  total: number;
  contact_ids: string[];
};

export async function importContacts(rows: ContactImportRow[], source = 'import'): Promise<ImportSummary> {
  let added = 0, updated = 0, skipped = 0, invalid = 0;
  const ids: string[] = [];
  for (const r of rows) {
    const hasEmail = r.email && isEmail(r.email);
    const hasLinkedIn = r.linkedin && isLinkedIn(r.linkedin);
    if (!hasEmail && !hasLinkedIn && !r.first_name) { invalid++; continue; }
    if (hasEmail) {
      const { contact, created } = await upsertContactByEmail({ ...r, source });
      ids.push(contact.id);
      if (created) added++; else updated++;
    } else {
      const c = await createContact({ ...r, source });
      ids.push(c.id);
      added++;
    }
  }
  return { added, updated, skipped, invalid, total: rows.length, contact_ids: ids };
}

/* ---------------- Events ---------------- */

export async function logEvent(input: Omit<ActivityEvent, 'id' | 'ts' | 'meta'> & { meta?: Record<string, unknown>; ts?: number }): Promise<ActivityEvent> {
  const ev: ActivityEvent = {
    id: newId(),
    contact_id: input.contact_id ?? null,
    enrollment_id: input.enrollment_id ?? null,
    sequence_id: input.sequence_id ?? null,
    step_idx: input.step_idx ?? null,
    type: input.type as EventType,
    meta: input.meta ?? {},
    ts: input.ts ?? Date.now(),
  };
  await outreachStorage.putEvent(ev);
  return ev;
}
