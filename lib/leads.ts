import { storage, LeadRecord } from './storage';

export type LeadStatus = 'complete' | 'in_progress' | 'abandoned';

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

export function computeStatus(lead: Lead, now = Date.now()): LeadStatus {
  if (lead.progress >= 100 || lead.last_step === 'submitted') return 'complete';
  if (now - lead.updated_at > DROP_OFF_MS) return 'abandoned';
  return 'in_progress';
}

export function packagePrice(pkg?: Lead['package']): number {
  if (pkg === 'basic') return 50;
  if (pkg === 'monthly') return 50;
  if (pkg === 'unlimited') return 50;
  return 0;
}

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
  };
  merged.progress = Math.max(base.progress, progressFromStep(merged.last_step));
  await storage.putLead(merged as unknown as LeadRecord);
  return merged;
}

export async function patchAdminFields(
  id: string,
  patch: Partial<Pick<Lead, 'notes' | 'contacted'>>,
): Promise<Lead | null> {
  const r = await storage.patchLead(id, patch as unknown as Partial<LeadRecord>);
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
