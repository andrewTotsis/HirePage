import { Redis } from '@upstash/redis';

/**
 * Storage abstraction: Upstash Redis (via REST) in prod, in-memory Map for dev.
 * Persists leads keyed by id with a sorted-by-updated_at secondary index.
 */

const LEADS_KEY = 'hirepage:leads';
const LEADS_INDEX_KEY = 'hirepage:leads:index';

type LeadRecord = Record<string, unknown> & { id: string; updated_at: number };

function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const mem: Map<string, LeadRecord> = (globalThis as any).__hp_mem_leads ?? new Map();
(globalThis as any).__hp_mem_leads = mem;

export const storage = {
  hasBackend(): boolean {
    return getRedis() !== null;
  },
  async putLead(lead: LeadRecord): Promise<void> {
    const redis = getRedis();
    if (redis) {
      await redis.hset(LEADS_KEY, { [lead.id]: JSON.stringify(lead) });
      await redis.zadd(LEADS_INDEX_KEY, { score: lead.updated_at, member: lead.id });
      return;
    }
    mem.set(lead.id, lead);
  },
  async getLead(id: string): Promise<LeadRecord | null> {
    const redis = getRedis();
    if (redis) {
      const v = await redis.hget<string>(LEADS_KEY, id);
      if (!v) return null;
      return typeof v === 'string' ? (JSON.parse(v) as LeadRecord) : (v as LeadRecord);
    }
    return mem.get(id) ?? null;
  },
  async listLeads(): Promise<LeadRecord[]> {
    const redis = getRedis();
    if (redis) {
      const map = (await redis.hgetall<Record<string, string | LeadRecord>>(LEADS_KEY)) ?? {};
      return Object.values(map).map((v) =>
        typeof v === 'string' ? (JSON.parse(v) as LeadRecord) : (v as LeadRecord),
      );
    }
    return Array.from(mem.values());
  },
  async patchLead(id: string, patch: Partial<LeadRecord>): Promise<LeadRecord | null> {
    const existing = await this.getLead(id);
    if (!existing) return null;
    const merged: LeadRecord = { ...existing, ...patch, id, updated_at: Date.now() };
    await this.putLead(merged);
    return merged;
  },
};

export type { LeadRecord };
