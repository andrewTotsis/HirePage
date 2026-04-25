import {
  ActivityEvent,
  Contact,
  Enrollment,
  EnrollmentStatus,
  EventType,
  outreachStorage,
  Sequence,
  SequenceStep,
} from './outreach-storage';

const DAY_MS = 24 * 60 * 60 * 1000;

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

/**
 * Parses bulk paste text. Supports:
 *  - One email per line
 *  - One LinkedIn URL per line
 *  - CSV (commas) with auto-detected headers (email, first_name, last_name, linkedin, company, title)
 *  - Tab-separated likewise
 *  - Mixed lines (an email and a linkedin URL on the same line, comma- or tab-separated)
 */
export function parseBulkInput(raw: string): ContactImportRow[] {
  const text = raw.replace(/\r\n?/g, '\n').trim();
  if (!text) return [];
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  // Detect delimiter
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

  // No delimiter: each line is a single field — guess email vs linkedin
  return lines.map((line) => {
    const out: ContactImportRow = {};
    if (isEmail(line)) out.email = line;
    else if (isLinkedIn(line)) out.linkedin = line.startsWith('http') ? line : `https://${line}`;
    else {
      const m = line.match(EMAIL_RE);
      const lm = line.match(LINKEDIN_RE);
      if (m) out.email = m[0];
      if (lm) out.linkedin = lm[0].startsWith('http') ? lm[0] : `https://${lm[0]}`;
      if (!m && !lm) out.first_name = line; // last resort: treat as a name
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
      // No email — just create a fresh contact (can't dedupe)
      const c = await createContact({ ...r, source });
      ids.push(c.id);
      added++;
    }
  }
  return { added, updated, skipped, invalid, total: rows.length, contact_ids: ids };
}

/* ---------------- Sequences ---------------- */

export function newSequenceStep(partial: Partial<SequenceStep> = {}): SequenceStep {
  return {
    id: newId(),
    ord: partial.ord ?? 0,
    delay_days: partial.delay_days ?? 0,
    subject: partial.subject ?? '',
    body: partial.body ?? '',
  };
}

export async function createSequence(name: string): Promise<Sequence> {
  const now = Date.now();
  const s: Sequence = {
    id: newId(),
    name: name.trim() || 'Untitled sequence',
    description: '',
    status: 'draft',
    steps: [newSequenceStep({ ord: 0, delay_days: 0 })],
    created_at: now,
    updated_at: now,
  };
  await outreachStorage.putSequence(s);
  return s;
}

export async function patchSequence(id: string, patch: Partial<Sequence>): Promise<Sequence | null> {
  const s = await outreachStorage.getSequence(id);
  if (!s) return null;
  const merged: Sequence = {
    ...s,
    ...patch,
    id: s.id,
    created_at: s.created_at,
    updated_at: Date.now(),
  };
  // Normalize step ords
  if (patch.steps) {
    merged.steps = patch.steps
      .map((st, i) => ({ ...st, id: st.id || newId(), ord: i, delay_days: Math.max(0, Number(st.delay_days) || 0) }));
  }
  await outreachStorage.putSequence(merged);
  return merged;
}

/* ---------------- Enrollments ---------------- */

export async function enrollContacts(sequenceId: string, contactIds: string[]): Promise<{ enrolled: number; skipped: number; reasons: Record<string, string> }> {
  const seq = await outreachStorage.getSequence(sequenceId);
  if (!seq || seq.steps.length === 0) return { enrolled: 0, skipped: contactIds.length, reasons: { _all: 'sequence has no steps' } };
  const now = Date.now();
  let enrolled = 0, skipped = 0;
  const reasons: Record<string, string> = {};
  for (const cid of contactIds) {
    const c = await outreachStorage.getContact(cid);
    if (!c) { skipped++; reasons[cid] = 'contact missing'; continue; }
    if (c.unsubscribed) { skipped++; reasons[cid] = 'unsubscribed'; continue; }
    if (c.bounced) { skipped++; reasons[cid] = 'bounced'; continue; }
    if (!c.email) { skipped++; reasons[cid] = 'no email'; continue; }
    const existing = await outreachStorage.findEnrollment(cid, sequenceId);
    if (existing) { skipped++; reasons[cid] = 'already enrolled'; continue; }
    const firstStep = seq.steps[0];
    const delayMs = (firstStep.delay_days ?? 0) * DAY_MS;
    const en: Enrollment = {
      id: newId(),
      contact_id: cid,
      sequence_id: sequenceId,
      status: 'active',
      current_step: 0,
      next_send_at: now + delayMs,
      started_at: now,
      updated_at: now,
    };
    await outreachStorage.putEnrollment(en);
    await logEvent({ contact_id: cid, enrollment_id: en.id, sequence_id: sequenceId, step_idx: 0, type: 'enrolled' });
    enrolled++;
  }
  return { enrolled, skipped, reasons };
}

export async function setEnrollmentStatus(id: string, status: EnrollmentStatus): Promise<Enrollment | null> {
  const e = await outreachStorage.getEnrollment(id);
  if (!e) return null;
  const updated: Enrollment = { ...e, status, updated_at: Date.now() };
  await outreachStorage.putEnrollment(updated);
  await logEvent({
    contact_id: e.contact_id,
    enrollment_id: e.id,
    sequence_id: e.sequence_id,
    step_idx: e.current_step,
    type: status === 'paused' ? 'paused' : status === 'active' ? 'resumed' : status === 'stopped' ? 'stopped' : 'note',
    meta: { new_status: status },
  });
  return updated;
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

/* ---------------- Stats ---------------- */

export type CountsByType = Partial<Record<EventType, number>>;

export type SequenceStats = {
  enrolled: number;
  sent: number;
  opened: number;
  clicked: number;
  replied: number;
  bounced: number;
  unsubscribed: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
};

export async function computeSequenceStats(sequenceId: string): Promise<SequenceStats> {
  const events = await outreachStorage.listEventsBySequence(sequenceId, 5000);
  return aggregateStats(events);
}

export async function computeGlobalStats(): Promise<SequenceStats> {
  const events = await outreachStorage.listEventsAll(10000);
  return aggregateStats(events);
}

function aggregateStats(events: ActivityEvent[]): SequenceStats {
  const counts: CountsByType = {};
  // Only count first-time events per (enrollment, type) for opened/clicked/replied to avoid double-count
  const dedup = new Set<string>();
  for (const e of events) {
    const key = `${e.enrollment_id ?? e.id}:${e.type}`;
    if (['opened', 'clicked', 'replied'].includes(e.type)) {
      if (dedup.has(key)) continue;
      dedup.add(key);
    }
    counts[e.type] = (counts[e.type] ?? 0) + 1;
  }
  const sent = counts.sent ?? 0;
  const enrolled = counts.enrolled ?? 0;
  const opened = counts.opened ?? 0;
  const clicked = counts.clicked ?? 0;
  const replied = counts.replied ?? 0;
  return {
    enrolled,
    sent,
    opened,
    clicked,
    replied,
    bounced: counts.bounced ?? 0,
    unsubscribed: counts.unsubscribed ?? 0,
    open_rate: sent ? opened / sent : 0,
    click_rate: sent ? clicked / sent : 0,
    reply_rate: sent ? replied / sent : 0,
  };
}

/* ---------------- Send tick (cron-driven) ---------------- */

import { sendOutreachEmail } from './email';
import { warmupStatus } from './warmup';

export type ProcessResult = {
  processed: number;
  sent: number;
  completed: number;
  errors: number;
  draft: number; // when no Resend API key — pretended as sent for tracking
  warmup_capped: boolean;
  warmup_remaining_today: number | null;
  details: Array<{ enrollment_id: string; result: string }>;
};

const MAX_PER_TICK = 25;

export async function processDueEnrollments(now: number = Date.now(), baseUrl?: string): Promise<ProcessResult> {
  const wu = await warmupStatus(now);
  const cap = Math.min(MAX_PER_TICK, Number.isFinite(wu.remaining_today) ? wu.remaining_today : MAX_PER_TICK);
  const due = cap > 0 ? await outreachStorage.listDueEnrollments(now, cap) : [];
  const out: ProcessResult = {
    processed: 0,
    sent: 0,
    completed: 0,
    errors: 0,
    draft: 0,
    warmup_capped: wu.enabled && wu.remaining_today === 0,
    warmup_remaining_today: Number.isFinite(wu.remaining_today) ? wu.remaining_today : null,
    details: [],
  };
  for (const en of due) {
    out.processed++;
    try {
      const seq = await outreachStorage.getSequence(en.sequence_id);
      const contact = await outreachStorage.getContact(en.contact_id);
      if (!seq || !contact) {
        await stopEnrollment(en, 'missing sequence or contact');
        out.details.push({ enrollment_id: en.id, result: 'missing' });
        continue;
      }
      if (seq.status !== 'active') {
        // Sequence not active — push next attempt out 1h
        const nextSendAt = now + 60 * 60 * 1000;
        await outreachStorage.putEnrollment({ ...en, next_send_at: nextSendAt, updated_at: now });
        out.details.push({ enrollment_id: en.id, result: 'sequence not active' });
        continue;
      }
      if (contact.unsubscribed || contact.bounced) {
        await stopEnrollment(en, contact.unsubscribed ? 'unsubscribed' : 'bounced');
        out.details.push({ enrollment_id: en.id, result: 'contact suppressed' });
        continue;
      }
      const step = seq.steps[en.current_step];
      if (!step) {
        await completeEnrollment(en);
        out.completed++;
        out.details.push({ enrollment_id: en.id, result: 'completed' });
        continue;
      }
      const subject = personalize(step.subject, contact);
      const body = personalize(step.body, contact);
      const send = await sendOutreachEmail({
        contact,
        enrollmentId: en.id,
        sequenceId: seq.id,
        stepIdx: en.current_step,
        subject,
        body,
        baseUrl,
      });
      if (send.draft) out.draft++; else out.sent++;
      await logEvent({
        contact_id: contact.id,
        enrollment_id: en.id,
        sequence_id: seq.id,
        step_idx: en.current_step,
        type: 'sent',
        meta: { provider_id: send.providerId ?? null, draft: send.draft, subject },
      });
      // Advance
      const nextIdx = en.current_step + 1;
      const nextStep = seq.steps[nextIdx];
      if (!nextStep) {
        await completeEnrollment({ ...en, current_step: nextIdx });
        out.completed++;
      } else {
        const nextDelay = (nextStep.delay_days ?? 0) * DAY_MS;
        await outreachStorage.putEnrollment({
          ...en,
          current_step: nextIdx,
          next_send_at: now + nextDelay,
          updated_at: now,
        });
      }
      out.details.push({ enrollment_id: en.id, result: send.draft ? 'draft' : 'sent' });
    } catch (e) {
      out.errors++;
      const msg = e instanceof Error ? e.message : 'error';
      await logEvent({
        contact_id: en.contact_id,
        enrollment_id: en.id,
        sequence_id: en.sequence_id,
        step_idx: en.current_step,
        type: 'note',
        meta: { error: msg },
      });
      // Push retry out 1h
      await outreachStorage.putEnrollment({ ...en, next_send_at: now + 60 * 60 * 1000, updated_at: now });
      out.details.push({ enrollment_id: en.id, result: `error: ${msg}` });
    }
  }
  return out;
}

async function stopEnrollment(en: Enrollment, reason: string): Promise<void> {
  await outreachStorage.putEnrollment({ ...en, status: 'stopped', next_send_at: null, updated_at: Date.now() });
  await logEvent({
    contact_id: en.contact_id,
    enrollment_id: en.id,
    sequence_id: en.sequence_id,
    step_idx: en.current_step,
    type: 'stopped',
    meta: { reason },
  });
}

async function completeEnrollment(en: Enrollment): Promise<void> {
  await outreachStorage.putEnrollment({ ...en, status: 'completed', next_send_at: null, updated_at: Date.now() });
  await logEvent({
    contact_id: en.contact_id,
    enrollment_id: en.id,
    sequence_id: en.sequence_id,
    step_idx: en.current_step,
    type: 'completed',
  });
}
