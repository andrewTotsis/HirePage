import { neon, NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Storage abstraction: Neon Postgres in prod, in-memory Map for dev.
 * The table is created on first use so there's no separate migration step.
 */

type LeadRecord = Record<string, unknown> & { id: string; updated_at: number };

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
        CREATE TABLE IF NOT EXISTS leads (
          id              text PRIMARY KEY,
          name            text NOT NULL DEFAULT '',
          email           text NOT NULL DEFAULT '',
          phone           text NOT NULL DEFAULT '',
          phone_country   text,
          role            jsonb NOT NULL DEFAULT '[]'::jsonb,
          linkedin        text NOT NULL DEFAULT '',
          github          text NOT NULL DEFAULT '',
          resume_name     text,
          resume_size     integer,
          resume_url      text,
          headshot_name   text,
          headshot_url    text,
          style           text,
          colors          jsonb NOT NULL DEFAULT '[]'::jsonb,
          custom_requests text,
          package         text,
          progress        integer NOT NULL DEFAULT 0,
          last_step       text NOT NULL DEFAULT 'welcome',
          notes           text NOT NULL DEFAULT '',
          contacted       boolean NOT NULL DEFAULT false,
          paid            boolean NOT NULL DEFAULT false,
          paid_at         bigint,
          delivered       boolean NOT NULL DEFAULT false,
          delivered_at    bigint,
          status_override text,
          created_at      bigint NOT NULL,
          updated_at      bigint NOT NULL
        )
      `;
      // Migrate older databases that pre-date the CRM columns.
      await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS paid boolean NOT NULL DEFAULT false`;
      await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS paid_at bigint`;
      await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS delivered boolean NOT NULL DEFAULT false`;
      await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS delivered_at bigint`;
      await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS status_override text`;
      await sql`CREATE INDEX IF NOT EXISTS leads_updated_at_idx ON leads (updated_at DESC)`;
      bootstrapped = true;
    })();
  }
  await bootstrapping;
}

function rowToRecord(r: Record<string, unknown>): LeadRecord {
  const parsed = {
    ...r,
    role: Array.isArray(r.role) ? r.role : (r.role ? JSON.parse(String(r.role)) : []),
    colors: Array.isArray(r.colors) ? r.colors : (r.colors ? JSON.parse(String(r.colors)) : []),
    created_at: Number(r.created_at),
    updated_at: Number(r.updated_at),
    progress: Number(r.progress ?? 0),
    contacted: Boolean(r.contacted),
    paid: Boolean(r.paid),
    paid_at: r.paid_at == null ? null : Number(r.paid_at),
    delivered: Boolean(r.delivered),
    delivered_at: r.delivered_at == null ? null : Number(r.delivered_at),
    status_override: (r.status_override as string | null) || null,
  };
  return parsed as unknown as LeadRecord;
}

const mem: Map<string, LeadRecord> = (globalThis as any).__hp_mem_leads ?? new Map();
(globalThis as any).__hp_mem_leads = mem;

export const storage = {
  hasBackend(): boolean {
    return !!(process.env.DATABASE_URL || process.env.POSTGRES_URL);
  },
  async putLead(lead: LeadRecord): Promise<void> {
    const sql = getSql();
    if (!sql) {
      mem.set(lead.id, lead);
      return;
    }
    await ensureSchema(sql);
    const l = lead as Record<string, unknown>;
    await sql`
      INSERT INTO leads (
        id, name, email, phone, phone_country, role, linkedin, github,
        resume_name, resume_size, resume_url, headshot_name, headshot_url,
        style, colors, custom_requests, package, progress, last_step,
        notes, contacted, paid, paid_at, delivered, delivered_at, status_override,
        created_at, updated_at
      ) VALUES (
        ${l.id}, ${l.name ?? ''}, ${l.email ?? ''}, ${l.phone ?? ''}, ${l.phone_country ?? null},
        ${JSON.stringify(l.role ?? [])}::jsonb, ${l.linkedin ?? ''}, ${l.github ?? ''},
        ${l.resume_name ?? null}, ${l.resume_size ?? null}, ${l.resume_url ?? null},
        ${l.headshot_name ?? null}, ${l.headshot_url ?? null},
        ${l.style ?? null}, ${JSON.stringify(l.colors ?? [])}::jsonb,
        ${l.custom_requests ?? null}, ${l.package ?? null},
        ${l.progress ?? 0}, ${l.last_step ?? 'welcome'},
        ${l.notes ?? ''}, ${l.contacted ?? false},
        ${l.paid ?? false}, ${l.paid_at ?? null},
        ${l.delivered ?? false}, ${l.delivered_at ?? null},
        ${l.status_override ?? null},
        ${l.created_at ?? Date.now()}, ${l.updated_at ?? Date.now()}
      )
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        phone_country = EXCLUDED.phone_country,
        role = EXCLUDED.role,
        linkedin = EXCLUDED.linkedin,
        github = EXCLUDED.github,
        resume_name = EXCLUDED.resume_name,
        resume_size = EXCLUDED.resume_size,
        resume_url = EXCLUDED.resume_url,
        headshot_name = EXCLUDED.headshot_name,
        headshot_url = EXCLUDED.headshot_url,
        style = EXCLUDED.style,
        colors = EXCLUDED.colors,
        custom_requests = EXCLUDED.custom_requests,
        package = EXCLUDED.package,
        progress = EXCLUDED.progress,
        last_step = EXCLUDED.last_step,
        notes = EXCLUDED.notes,
        contacted = EXCLUDED.contacted,
        paid = EXCLUDED.paid,
        paid_at = EXCLUDED.paid_at,
        delivered = EXCLUDED.delivered,
        delivered_at = EXCLUDED.delivered_at,
        status_override = EXCLUDED.status_override,
        updated_at = EXCLUDED.updated_at
    `;
  },
  async getLead(id: string): Promise<LeadRecord | null> {
    const sql = getSql();
    if (!sql) return mem.get(id) ?? null;
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM leads WHERE id = ${id} LIMIT 1`) as Record<string, unknown>[];
    return rows[0] ? rowToRecord(rows[0]) : null;
  },
  async listLeads(): Promise<LeadRecord[]> {
    const sql = getSql();
    if (!sql) return Array.from(mem.values());
    await ensureSchema(sql);
    const rows = (await sql`SELECT * FROM leads ORDER BY updated_at DESC LIMIT 1000`) as Record<string, unknown>[];
    return rows.map(rowToRecord);
  },
  async patchLead(id: string, patch: Partial<LeadRecord>): Promise<LeadRecord | null> {
    const existing = await this.getLead(id);
    if (!existing) return null;
    const merged: LeadRecord = { ...existing, ...patch, id, updated_at: Date.now() };
    await this.putLead(merged);
    return merged;
  },
  async deleteLead(id: string): Promise<boolean> {
    const sql = getSql();
    if (!sql) return mem.delete(id);
    await ensureSchema(sql);
    const rows = (await sql`DELETE FROM leads WHERE id = ${id} RETURNING id`) as Record<string, unknown>[];
    return rows.length > 0;
  },
};

export type { LeadRecord };
