import { storage, LeadRecord } from './storage';

export type FunnelStatus =
  | 'lead'
  | 'in_progress'
  | 'complete'
  | 'paid'
  | 'delivered'
  | 'abandoned';

export type Lead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  phone_country?: string;
  role: string[];
  linkedin: string;
  github: string;
  resume_name?: string;
  resume_size?: number;
  resume_url?: string;
  headshot_name?: string;
  headshot_url?: string;
  style?: string;
  colors: string[];
  custom_requests?: string;
  package?: 'basic' | 'monthly' | 'unlimited';
  progress: number;
  last_step: string;
  notes: string;
  contacted: boolean;
  paid: boolean;
  paid_at: number | null;
  delivered: boolean;
  delivered_at: number | null;
  status_override: FunnelStatus | null;
  created_at: number;
  updated_at: number;
};

export const STEP_ORDER = [
  'welcome',
  'name',
  'email',
  'phone',
  'roles',
  'linkedin',
  'github',
  'resume',
  'headshot',
  'style',
  'colors',
  'requests',
  'package',
  'review',
  'submitted',
] as const;

export type StepId = (typeof STEP_ORDER)[number];

const DROP_OFF_MS = 24 * 60 * 60 * 1000;

/**
 * Funnel logic — derived from underlying booleans / progress unless the user
 * explicitly set status_override. Auto-derivation order (highest wins):
 *
 *   delivered → paid → complete (intake 100%) → abandoned (>24h, <100%)
 *   → in_progress (some intake) → lead (just created)
 */
export function computeStatus(l: Lead, now = Date.now()): FunnelStatus {
  if (l.status_override) return l.status_override;
  if (l.delivered) return 'delivered';
  if (l.paid) return 'paid';
  if (l.progress >= 100 || l.last_step === 'submitted') return 'complete';
  if (now - l.updated_at > DROP_OFF_MS && l.progress < 100) return 'abandoned';
  if (l.progress > 5 && l.last_step !== 'welcome') return 'in_progress';
  return 'lead';
}

export const STATUS_LABELS: Record<FunnelStatus, string> = {
  lead: 'Lead',
  in_progress: 'In Progress',
  complete: 'Intake Complete',
  paid: 'Paid',
  delivered: 'Delivered',
  abandoned: 'Abandoned',
};

export function packageLabel(pkg?: Lead['package']): string {
  if (pkg === 'basic') return '$50 Basic';
  if (pkg === 'monthly') return '$50 + $5/mo';
  if (pkg === 'unlimited') return '$50 + $10/mo';
  return '—';
}

export function progressFromStep(lastStep: string): number {
  const i = STEP_ORDER.indexOf(lastStep as StepId);
  if (i < 0) return 0;
  if (lastStep === 'submitted') return 100;
  return Math.round((i / (STEP_ORDER.length - 1)) * 100);
}

function sanitizeUpsert(input: Partial<Lead>): Partial<Lead> {
  const clean: Partial<Lead> = {};
  const allow: (keyof Lead)[] = [
    'name',
    'email',
    'phone',
    'phone_country',
    'role',
    'linkedin',
    'github',
    'resume_name',
    'resume_size',
    'headshot_name',
    'style',
    'colors',
    'custom_requests',
    'package',
    'last_step',
  ];
  for (const k of allow) {
    if (input[k] !== undefined) (clean as any)[k] = input[k];
  }
  return clean;
}

export async function upsertLead(id: string, patch: Partial<Lead>): Promise<Lead> {
  const now = Date.now();
  const existing = (await storage.getLead(id)) as unknown as Lead | null;
  const base: Lead = existing ?? {
    id,
    name: '',
    email: '',
    phone: '',
    role: [],
    linkedin: '',
    github: '',
    colors: [],
    progress: 0,
    last_step: 'welcome',
    notes: '',
    contacted: false,
    paid: false,
    paid_at: null,
    delivered: false,
    delivered_at: null,
    status_override: null,
    created_at: now,
    updated_at: now,
  };
  const clean = sanitizeUpsert(patch);
  const merged: Lead = {
    ...base,
    ...clean,
    id,
    updated_at: now,
    created_at: base.created_at,
    notes: base.notes,
    contacted: base.contacted,
    paid: base.paid,
    paid_at: base.paid_at ?? null,
    delivered: base.delivered,
    delivered_at: base.delivered_at ?? null,
    status_override: base.status_override ?? null,
  };
  merged.progress = Math.max(base.progress, progressFromStep(merged.last_step));
  await storage.putLead(merged as unknown as LeadRecord);
  return merged;
}

/**
 * Admin-side patch — accepts a wider field set than onboarding upsert,
 * including manual overrides (paid, delivered, status_override) and
 * primary identity fields (name, email, package).
 *
 * Side effects:
 *   - Setting paid=true auto-stamps paid_at if it was null
 *   - Setting paid=false clears paid_at
 *   - Same logic for delivered / delivered_at
 *   - Setting progress is honoured (manual intake override)
 */
export type AdminPatch = Partial<
  Pick<
    Lead,
    | 'name'
    | 'email'
    | 'phone'
    | 'phone_country'
    | 'package'
    | 'progress'
    | 'last_step'
    | 'notes'
    | 'contacted'
    | 'paid'
    | 'delivered'
    | 'status_override'
    | 'role'
    | 'linkedin'
    | 'github'
    | 'custom_requests'
    | 'style'
    | 'colors'
  >
>;

export async function patchAdminLead(id: string, patch: AdminPatch): Promise<Lead | null> {
  const existing = (await storage.getLead(id)) as unknown as Lead | null;
  if (!existing) return null;
  const now = Date.now();
  const next: Partial<LeadRecord> = { ...patch } as Partial<LeadRecord>;

  if (typeof patch.paid === 'boolean') {
    if (patch.paid && !existing.paid) (next as any).paid_at = now;
    if (!patch.paid) (next as any).paid_at = null;
  }
  if (typeof patch.delivered === 'boolean') {
    if (patch.delivered && !existing.delivered) (next as any).delivered_at = now;
    if (!patch.delivered) (next as any).delivered_at = null;
  }
  if (typeof patch.notes === 'string') {
    (next as any).notes = patch.notes.slice(0, 10_000);
  }
  if (typeof patch.progress === 'number') {
    (next as any).progress = Math.max(0, Math.min(100, Math.round(patch.progress)));
  }
  if (patch.status_override === null || patch.status_override === undefined) {
    if ('status_override' in patch) (next as any).status_override = null;
  }

  const r = await storage.patchLead(id, next as unknown as Partial<LeadRecord>);
  return (r as unknown as Lead) ?? null;
}

export async function getLead(id: string): Promise<Lead | null> {
  const r = await storage.getLead(id);
  return (r as unknown as Lead) ?? null;
}

export async function listLeads(): Promise<Lead[]> {
  const all = await storage.listLeads();
  return (all as unknown as Lead[]).sort((a, b) => b.updated_at - a.updated_at);
}

export async function deleteLead(id: string): Promise<boolean> {
  return storage.deleteLead(id);
}

/**
 * Idempotent: mark a lead as paid by email. Used by the Stripe webhook.
 *
 * Behaviour:
 * - If a lead exists with this email and isn't already paid, flip paid=true and
 *   stamp paid_at. If `pkg` is supplied and the lead has no package yet,
 *   backfill it.
 * - If no lead exists, create a stub lead so the payment still surfaces in the
 *   CRM (we don't want to lose the signal just because they paid before
 *   completing intake — e.g. someone got the link forwarded to them).
 * - Always safe to call repeatedly with the same input.
 */
export async function markPaidByEmail(
  email: string,
  pkg?: Lead['package'],
  meta?: { source?: string },
): Promise<{ lead: Lead; created: boolean; alreadyPaid: boolean }> {
  const e = email.trim().toLowerCase();
  if (!e) throw new Error('email required');
  const existing = (await storage.findLeadByEmail(e)) as unknown as Lead | null;
  const now = Date.now();

  if (existing) {
    if (existing.paid) {
      return { lead: existing, created: false, alreadyPaid: true };
    }
    const patch: AdminPatch = { paid: true };
    if (!existing.package && pkg) patch.package = pkg;
    if (existing.progress < 100) patch.progress = 100;
    if (existing.last_step !== 'submitted') patch.last_step = 'submitted';
    const updated = await patchAdminLead(existing.id, patch);
    return { lead: updated!, created: false, alreadyPaid: false };
  }

  // No matching lead — create a stub so the payment shows up in the CRM.
  const id = `stripe_${Math.random().toString(36).slice(2, 10)}${now.toString(36)}`;
  const stub: Lead = {
    id,
    name: '',
    email: e,
    phone: '',
    role: [],
    linkedin: '',
    github: '',
    colors: [],
    package: pkg,
    progress: 100,
    last_step: 'submitted',
    notes: meta?.source ? `Auto-created by ${meta.source}` : 'Auto-created from Stripe payment',
    contacted: false,
    paid: true,
    paid_at: now,
    delivered: false,
    delivered_at: null,
    status_override: null,
    created_at: now,
    updated_at: now,
  };
  await storage.putLead(stub as unknown as LeadRecord);
  return { lead: stub, created: true, alreadyPaid: false };
}
