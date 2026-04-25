import { neon, NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Storage for the outreach CRM (contacts / sequences / enrollments / events / templates).
 * Self-bootstrapping: schema is created on first use. Falls back to in-memory Maps when
 * DATABASE_URL is missing (demo mode).
 */

let cached: NeonQueryFunction<false, false> | null = null;
let bootstrapped = false;
let bootstrapping: Promise<void> | null = null;

function getSql(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  if (!cached) cached = neon(url);
  return cached;
}

async function ensureSchema(sql: NeonQueryFunction<false, false>): Promise<void> {
  if (bootstrapped) return;
  if (!bootstrapping) {
    bootstrapping = (async () => {
      await sql`
        CREATE TABLE IF NOT EXISTS outreach_contacts (
          id            text PRIMARY KEY,
          email         text NOT NULL DEFAULT '',
          first_name    text NOT NULL DEFAULT '',
          last_name     text NOT NULL DEFAULT '',
          linkedin      text NOT NULL DEFAULT '',
          company       text NOT NULL DEFAULT '',
          title         text NOT NULL DEFAULT '',
          tags          jsonb NOT NULL DEFAULT '[]'::jsonb,
          custom        jsonb NOT NULL DEFAULT '{}'::jsonb,
          source        text NOT NULL DEFAULT 'manual',
          unsubscribed  boolean NOT NULL DEFAULT false,
          bounced       boolean NOT NULL DEFAULT false,
          notes         text NOT NULL DEFAULT '',
          unsub_token   text NOT NULL DEFAULT '',
          created_at    bigint NOT NULL,
          updated_at    bigint NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS outreach_contacts_email_idx ON outreach_contacts (lower(email))`;
      await sql`CREATE INDEX IF NOT EXISTS outreach_contacts_updated_idx ON outreach_contacts (updated_at DESC)`;

      await sql`
        CREATE TABLE IF NOT EXISTS outreach_sequences (
          id          text PRIMARY KEY,
          name        text NOT NULL,
          description text NOT NULL DEFAULT '',
          status      text NOT NULL DEFAULT 'draft',
          steps       jsonb NOT NULL DEFAULT '[]'::jsonb,
          created_at  bigint NOT NULL,
          updated_at  bigint NOT NULL
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS outreach_enrollments (
          id            text PRIMARY KEY,
          contact_id    text NOT NULL,
          sequence_id   text NOT NULL,
          status        text NOT NULL DEFAULT 'active',
          current_step  integer NOT NULL DEFAULT 0,
          next_send_at  bigint,
          started_at    bigint NOT NULL,
          updated_at    bigint NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS outreach_enrollments_next_idx ON outreach_enrollments (next_send_at)`;
      await sql`CREATE INDEX IF NOT EXISTS outreach_enrollments_contact_idx ON outreach_enrollments (contact_id)`;
      await sql`CREATE INDEX IF NOT EXISTS outreach_enrollments_seq_idx ON outreach_enrollments (sequence_id)`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS outreach_enrollments_unique_idx ON outreach_enrollments (contact_id, sequence_id)`;

      await sql`
        CREATE TABLE IF NOT EXISTS outreach_events (
          id             text PRIMARY KEY,
          contact_id     text,
          enrollment_id  text,
          sequence_id    text,
          step_idx       integer,
          type           text NOT NULL,
          meta           jsonb NOT NULL DEFAULT '{}'::jsonb,
          ts             bigint NOT NULL
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS outreach_events_contact_idx ON outreach_events (contact_id, ts DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS outreach_events_enrollment_idx ON outreach_events (enrollment_id, ts DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS outreach_events_seq_idx ON outreach_events (sequence_id, ts DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS outreach_events_type_idx ON outreach_events (type, ts DESC)`;

      await sql`
        CREATE TABLE IF NOT EXISTS outreach_templates (
          id          text PRIMARY KEY,
          name        text NOT NULL,
          subject     text NOT NULL DEFAULT '',
          body        text NOT NULL DEFAULT '',
          created_at  bigint NOT NULL,
          updated_at  bigint NOT NULL
        )
      `;
      await sql`
        CREATE TABLE IF NOT EXISTS outreach_settings (
          key         text PRIMARY KEY,
          value       jsonb NOT NULL DEFAULT '{}'::jsonb,
          updated_at  bigint NOT NULL
        )
      `;
      bootstrapped = true;
    })();
  }
  await bootstrapping;
}

/* ---------------- Types ---------------- */

export type Contact = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  linkedin: string;
  company: string;
  title: string;
  tags: string[];
  custom: Record<string, string>;
  source: string;
  unsubscribed: boolean;
  bounced: boolean;
  notes: string;
  unsub_token: string;
  created_at: number;
  updated_at: number;
};

export type SequenceStep = {
  id: string;
  ord: number;
  delay_days: number;
  subject: string;
  body: string;
};

export type Sequence = {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused';
  steps: SequenceStep[];
  created_at: number;
  updated_at: number;
};

export type EnrollmentStatus =
  | 'active'
  | 'paused'
  | 'completed'
  | 'stopped'
  | 'bounced'
  | 'unsubscribed';

export type Enrollment = {
  id: string;
  contact_id: string;
  sequence_id: string;
  status: EnrollmentStatus;
  current_step: number;
  next_send_at: number | null;
  started_at: number;
  updated_at: number;
};

export type EventType =
  | 'enrolled'
  | 'queued'
  | 'sent'
  | 'opened'
  | 'clicked'
  | 'replied'
  | 'bounced'
  | 'unsubscribed'
  | 'completed'
  | 'stopped'
  | 'paused'
  | 'resumed'
  | 'skipped'
  | 'note';

export type ActivityEvent = {
  id: string;
  contact_id: string | null;
  enrollment_id: string | null;
  sequence_id: string | null;
  step_idx: number | null;
  type: EventType;
  meta: Record<string, unknown>;
  ts: number;
};

export type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: number;
  updated_at: number;
};

/* ---------------- Memory fallback ---------------- */

const g = globalThis as any;
const memContacts: Map<string, Contact> = g.__hp_mem_contacts ?? new Map();
const memSequences: Map<string, Sequence> = g.__hp_mem_sequences ?? new Map();
const memEnrollments: Map<string, Enrollment> = g.__hp_mem_enrollments ?? new Map();
const memEvents: Map<string, ActivityEvent> = g.__hp_mem_events ?? new Map();
const memTemplates: Map<string, Template> = g.__hp_mem_templates ?? new Map();
g.__hp_mem_contacts = memContacts;
g.__hp_mem_sequences = memSequences;
g.__hp_mem_enrollments = memEnrollments;
g.__hp_mem_events = memEvents;
g.__hp_mem_templates = memTemplates;

/* ---------------- Helpers ---------------- */

function num(v: unknown, d = 0): number {
  return v === null || v === undefined ? d : Number(v);
}
function jsonOr<T>(v: unknown, fallback: T): T {
  if (Array.isArray(v) || (v && typeof v === 'object')) return v as T;
  if (typeof v === 'string') {
    try { return JSON.parse(v) as T; } catch { return fallback; }
  }
  return fallback;
}

function rowToContact(r: Record<string, unknown>): Contact {
  return {
    id: String(r.id),
    email: String(r.email ?? ''),
    first_name: String(r.first_name ?? ''),
    last_name: String(r.last_name ?? ''),
    linkedin: String(r.linkedin ?? ''),
    company: String(r.company ?? ''),
    title: String(r.title ?? ''),
    tags: jsonOr<string[]>(r.tags, []),
    custom: jsonOr<Record<string, string>>(r.custom, {}),
    source: String(r.source ?? 'manual'),
    unsubscribed: Boolean(r.unsubscribed),
    bounced: Boolean(r.bounced),
    notes: String(r.notes ?? ''),
    unsub_token: String(r.unsub_token ?? ''),
    created_at: num(r.created_at),
    updated_at: num(r.updated_at),
  };
}

function rowToSequence(r: Record<string, unknown>): Sequence {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    description: String(r.description ?? ''),
    status: (String(r.status ?? 'draft') as Sequence['status']),
    steps: jsonOr<SequenceStep[]>(r.steps, []),
    created_at: num(r.created_at),
    updated_at: num(r.updated_at),
  };
}

function rowToEnrollment(r: Record<string, unknown>): Enrollment {
  return {
    id: String(r.id),
    contact_id: String(r.contact_id),
    sequence_id: String(r.sequence_id),
    status: String(r.status ?? 'active') as EnrollmentStatus,
    current_step: num(r.current_step, 0),
    next_send_at: r.next_send_at == null ? null : num(r.next_send_at),
    started_at: num(r.started_at),
    updated_at: num(r.updated_at),
  };
}

function rowToEvent(r: Record<string, unknown>): ActivityEvent {
  return {
    id: String(r.id),
    contact_id: r.contact_id ? String(r.contact_id) : null,
    enrollment_id: r.enrollment_id ? String(r.enrollment_id) : null,
    sequence_id: r.sequence_id ? String(r.sequence_id) : null,
    step_idx: r.step_idx == null ? null : num(r.step_idx),
    type: String(r.type) as EventType,
    meta: jsonOr<Record<string, unknown>>(r.meta, {}),
    ts: num(r.ts),
  };
}

function rowToTemplate(r: Record<string, unknown>): Template {
  return {
    id: String(r.id),
    name: String(r.name ?? ''),
    subject: String(r.subject ?? ''),
    body: String(r.body ?? ''),
    created_at: num(r.created_at),
    updated_at: num(r.updated_at),
  };
}

/* ---------------- Public API ---------------- */

export const outreachStorage = {
  hasBackend(): boolean {
    return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  },

  /* contacts */
  async putContact(c: Contact): Promise<void> {
    const sql = getSql();
    if (!sql) { memContacts.set(c.id, c); return; }
    await ensureSchema(sql);
    await sql`
      INSERT INTO outreach_contacts (
        id, email, first_name, last_name, linkedin, company, title,
        tags, custom, source, unsubscribed, bounced, notes, unsub_token,
        created_at, updated_at
      ) VALUES (
        ${c.id}, ${c.email}, ${c.first_name}, ${c.last_name}, ${c.linkedin}, ${c.company}, ${c.title},
        ${JSON.stringify(c.tags)}::jsonb, ${JSON.stringify(c.custom)}::jsonb, ${c.source},
        ${c.unsubscribed}, ${c.bounced}, ${c.notes}, ${c.unsub_token},
        ${c.created_at}, ${c.updated_at}
      )
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        linkedin = EXCLUDED.linkedin,
        company = EXCLUDED.company,
        title = EXCLUDED.title,
        tags = EXCLUDED.tags,
        custom = EXCLUDED.custom,
        source = EXCLUDED.source,
        unsubscribed = EXCLUDED.unsubscribed,
        bounced = EXCLUDED.bounced,
        notes = EXCLUDED.notes,
        unsub_token = EXCLUDED.unsub_token,
        updated_at = EXCLUDED.updated_at
    `;
  },
  async getContact(id: string): Promise<Contact | null> {
    const sql = getSql();
    if (!sql) return memContacts.get(id) ?? null;
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_contacts WHERE id = ${id} LIMIT 1`) as Record<string, unknown>[];
    return rows[0] ? rowToContact(rows[0]) : null;
  },
  async getContactByEmail(email: string): Promise<Contact | null> {
    const e = email.trim().toLowerCase();
    if (!e) return null;
    const sql = getSql();
    if (!sql) {
      for (const c of memContacts.values()) if (c.email.toLowerCase() === e) return c;
      return null;
    }
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_contacts WHERE lower(email) = ${e} LIMIT 1`) as Record<string, unknown>[];
    return rows[0] ? rowToContact(rows[0]) : null;
  },
  async getContactByUnsubToken(token: string): Promise<Contact | null> {
    const t = token.trim();
    if (!t) return null;
    const sql = getSql();
    if (!sql) {
      for (const c of memContacts.values()) if (c.unsub_token === t) return c;
      return null;
    }
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_contacts WHERE unsub_token = ${t} LIMIT 1`) as Record<string, unknown>[];
    return rows[0] ? rowToContact(rows[0]) : null;
  },
  async listContacts(): Promise<Contact[]> {
    const sql = getSql();
    if (!sql) return Array.from(memContacts.values()).sort((a, b) => b.updated_at - a.updated_at);
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_contacts ORDER BY updated_at DESC LIMIT 5000`) as Record<string, unknown>[];
    return rows.map(rowToContact);
  },
  async patchContact(id: string, patch: Partial<Contact>): Promise<Contact | null> {
    const c = await this.getContact(id);
    if (!c) return null;
    const merged: Contact = { ...c, ...patch, id, updated_at: Date.now() };
    await this.putContact(merged);
    return merged;
  },
  async deleteContact(id: string): Promise<boolean> {
    const sql = getSql();
    if (!sql) {
      const had = memContacts.delete(id);
      for (const e of Array.from(memEnrollments.values())) if (e.contact_id === id) memEnrollments.delete(e.id);
      return had;
    }
    await ensureSchema(sql);
    await sql`DELETE FROM outreach_enrollments WHERE contact_id = ${id}`;
    const rows = (await sql`DELETE FROM outreach_contacts WHERE id = ${id} RETURNING id`) as Record<string, unknown>[];
    return rows.length > 0;
  },

  /* sequences */
  async putSequence(s: Sequence): Promise<void> {
    const sql = getSql();
    if (!sql) { memSequences.set(s.id, s); return; }
    await ensureSchema(sql);
    await sql`
      INSERT INTO outreach_sequences (id, name, description, status, steps, created_at, updated_at)
      VALUES (
        ${s.id}, ${s.name}, ${s.description}, ${s.status},
        ${JSON.stringify(s.steps)}::jsonb, ${s.created_at}, ${s.updated_at}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        description = EXCLUDED.description,
        status = EXCLUDED.status,
        steps = EXCLUDED.steps,
        updated_at = EXCLUDED.updated_at
    `;
  },
  async getSequence(id: string): Promise<Sequence | null> {
    const sql = getSql();
    if (!sql) return memSequences.get(id) ?? null;
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_sequences WHERE id = ${id} LIMIT 1`) as Record<string, unknown>[];
    return rows[0] ? rowToSequence(rows[0]) : null;
  },
  async listSequences(): Promise<Sequence[]> {
    const sql = getSql();
    if (!sql) return Array.from(memSequences.values()).sort((a, b) => b.updated_at - a.updated_at);
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_sequences ORDER BY updated_at DESC LIMIT 500`) as Record<string, unknown>[];
    return rows.map(rowToSequence);
  },
  async deleteSequence(id: string): Promise<boolean> {
    const sql = getSql();
    if (!sql) {
      memSequences.delete(id);
      for (const e of Array.from(memEnrollments.values())) if (e.sequence_id === id) memEnrollments.delete(e.id);
      return true;
    }
    await ensureSchema(sql);
    await sql`DELETE FROM outreach_enrollments WHERE sequence_id = ${id}`;
    const rows = (await sql`DELETE FROM outreach_sequences WHERE id = ${id} RETURNING id`) as Record<string, unknown>[];
    return rows.length > 0;
  },

  /* enrollments */
  async putEnrollment(e: Enrollment): Promise<void> {
    const sql = getSql();
    if (!sql) { memEnrollments.set(e.id, e); return; }
    await ensureSchema(sql);
    await sql`
      INSERT INTO outreach_enrollments (
        id, contact_id, sequence_id, status, current_step, next_send_at, started_at, updated_at
      ) VALUES (
        ${e.id}, ${e.contact_id}, ${e.sequence_id}, ${e.status}, ${e.current_step},
        ${e.next_send_at}, ${e.started_at}, ${e.updated_at}
      )
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        current_step = EXCLUDED.current_step,
        next_send_at = EXCLUDED.next_send_at,
        updated_at = EXCLUDED.updated_at
    `;
  },
  async getEnrollment(id: string): Promise<Enrollment | null> {
    const sql = getSql();
    if (!sql) return memEnrollments.get(id) ?? null;
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_enrollments WHERE id = ${id} LIMIT 1`) as Record<string, unknown>[];
    return rows[0] ? rowToEnrollment(rows[0]) : null;
  },
  async findEnrollment(contactId: string, sequenceId: string): Promise<Enrollment | null> {
    const sql = getSql();
    if (!sql) {
      for (const e of memEnrollments.values()) {
        if (e.contact_id === contactId && e.sequence_id === sequenceId) return e;
      }
      return null;
    }
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_enrollments WHERE contact_id = ${contactId} AND sequence_id = ${sequenceId} LIMIT 1`) as Record<string, unknown>[];
    return rows[0] ? rowToEnrollment(rows[0]) : null;
  },
  async listEnrollmentsByContact(contactId: string): Promise<Enrollment[]> {
    const sql = getSql();
    if (!sql) return Array.from(memEnrollments.values()).filter((e) => e.contact_id === contactId);
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_enrollments WHERE contact_id = ${contactId}`) as Record<string, unknown>[];
    return rows.map(rowToEnrollment);
  },
  async listEnrollmentsBySequence(sequenceId: string): Promise<Enrollment[]> {
    const sql = getSql();
    if (!sql) return Array.from(memEnrollments.values()).filter((e) => e.sequence_id === sequenceId);
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_enrollments WHERE sequence_id = ${sequenceId} ORDER BY updated_at DESC`) as Record<string, unknown>[];
    return rows.map(rowToEnrollment);
  },
  async listAllEnrollments(): Promise<Enrollment[]> {
    const sql = getSql();
    if (!sql) return Array.from(memEnrollments.values());
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_enrollments ORDER BY updated_at DESC LIMIT 5000`) as Record<string, unknown>[];
    return rows.map(rowToEnrollment);
  },
  async listDueEnrollments(now: number, limit = 50): Promise<Enrollment[]> {
    const sql = getSql();
    if (!sql) {
      return Array.from(memEnrollments.values())
        .filter((e) => e.status === 'active' && e.next_send_at !== null && e.next_send_at <= now)
        .slice(0, limit);
    }
    await ensureSchema(sql);
    const rows = (await sql`
      SELECT * FROM outreach_enrollments
      WHERE status = 'active' AND next_send_at IS NOT NULL AND next_send_at <= ${now}
      ORDER BY next_send_at ASC
      LIMIT ${limit}
    `) as Record<string, unknown>[];
    return rows.map(rowToEnrollment);
  },
  async deleteEnrollment(id: string): Promise<boolean> {
    const sql = getSql();
    if (!sql) return memEnrollments.delete(id);
    await ensureSchema(sql);
    const rows = (await sql`DELETE FROM outreach_enrollments WHERE id = ${id} RETURNING id`) as Record<string, unknown>[];
    return rows.length > 0;
  },

  /* events */
  async putEvent(e: ActivityEvent): Promise<void> {
    const sql = getSql();
    if (!sql) { memEvents.set(e.id, e); return; }
    await ensureSchema(sql);
    await sql`
      INSERT INTO outreach_events (id, contact_id, enrollment_id, sequence_id, step_idx, type, meta, ts)
      VALUES (
        ${e.id}, ${e.contact_id}, ${e.enrollment_id}, ${e.sequence_id},
        ${e.step_idx}, ${e.type}, ${JSON.stringify(e.meta)}::jsonb, ${e.ts}
      )
    `;
  },
  async listEventsByContact(contactId: string, limit = 100): Promise<ActivityEvent[]> {
    const sql = getSql();
    if (!sql) {
      return Array.from(memEvents.values())
        .filter((e) => e.contact_id === contactId)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, limit);
    }
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_events WHERE contact_id = ${contactId} ORDER BY ts DESC LIMIT ${limit}`) as Record<string, unknown>[];
    return rows.map(rowToEvent);
  },
  async listEventsBySequence(sequenceId: string, limit = 200): Promise<ActivityEvent[]> {
    const sql = getSql();
    if (!sql) {
      return Array.from(memEvents.values())
        .filter((e) => e.sequence_id === sequenceId)
        .sort((a, b) => b.ts - a.ts)
        .slice(0, limit);
    }
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_events WHERE sequence_id = ${sequenceId} ORDER BY ts DESC LIMIT ${limit}`) as Record<string, unknown>[];
    return rows.map(rowToEvent);
  },
  async listEventsAll(limit = 1000): Promise<ActivityEvent[]> {
    const sql = getSql();
    if (!sql) return Array.from(memEvents.values()).sort((a, b) => b.ts - a.ts).slice(0, limit);
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_events ORDER BY ts DESC LIMIT ${limit}`) as Record<string, unknown>[];
    return rows.map(rowToEvent);
  },

  /* templates */
  async putTemplate(t: Template): Promise<void> {
    const sql = getSql();
    if (!sql) { memTemplates.set(t.id, t); return; }
    await ensureSchema(sql);
    await sql`
      INSERT INTO outreach_templates (id, name, subject, body, created_at, updated_at)
      VALUES (${t.id}, ${t.name}, ${t.subject}, ${t.body}, ${t.created_at}, ${t.updated_at})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        subject = EXCLUDED.subject,
        body = EXCLUDED.body,
        updated_at = EXCLUDED.updated_at
    `;
  },
  async listTemplates(): Promise<Template[]> {
    const sql = getSql();
    if (!sql) return Array.from(memTemplates.values()).sort((a, b) => b.updated_at - a.updated_at);
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM outreach_templates ORDER BY updated_at DESC LIMIT 500`) as Record<string, unknown>[];
    return rows.map(rowToTemplate);
  },
  async deleteTemplate(id: string): Promise<boolean> {
    const sql = getSql();
    if (!sql) return memTemplates.delete(id);
    await ensureSchema(sql);
    const rows = (await sql`DELETE FROM outreach_templates WHERE id = ${id} RETURNING id`) as Record<string, unknown>[];
    return rows.length > 0;
  },

  /* settings */
  async getSetting<T = Record<string, unknown>>(key: string): Promise<T | null> {
    const sql = getSql();
    if (!sql) {
      const v = (g.__hp_mem_settings as Map<string, unknown>)?.get(key);
      return (v as T) ?? null;
    }
    await ensureSchema(sql);
    const rows = (await sql`SELECT value FROM outreach_settings WHERE key = ${key} LIMIT 1`) as Record<string, unknown>[];
    if (!rows[0]) return null;
    const raw = rows[0].value;
    return (typeof raw === 'string' ? JSON.parse(raw) : raw) as T;
  },
  async putSetting(key: string, value: Record<string, unknown>): Promise<void> {
    const sql = getSql();
    if (!sql) {
      const m = ((g.__hp_mem_settings as Map<string, unknown>) ?? new Map());
      m.set(key, value);
      g.__hp_mem_settings = m;
      return;
    }
    await ensureSchema(sql);
    await sql`
      INSERT INTO outreach_settings (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${Date.now()})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    `;
  },
  async deleteSetting(key: string): Promise<void> {
    const sql = getSql();
    if (!sql) {
      ((g.__hp_mem_settings as Map<string, unknown>) ?? new Map()).delete(key);
      return;
    }
    await ensureSchema(sql);
    await sql`DELETE FROM outreach_settings WHERE key = ${key}`;
  },

  /* aggregate helpers */
  async countSentSince(sinceMs: number): Promise<number> {
    const sql = getSql();
    if (!sql) {
      let n = 0;
      for (const e of memEvents.values()) if (e.type === 'sent' && e.ts >= sinceMs) n++;
      return n;
    }
    await ensureSchema(sql);
    const rows = (await sql`SELECT COUNT(*)::int AS n FROM outreach_events WHERE type = 'sent' AND ts >= ${sinceMs}`) as Record<string, unknown>[];
    return Number(rows[0]?.n ?? 0);
  },
};
