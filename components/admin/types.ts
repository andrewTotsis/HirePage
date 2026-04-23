export type AdminLead = {
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

export type Segment = 'all' | 'hot' | 'dropoff' | 'complete' | 'contacted';
export type SortBy = 'recent' | 'intent' | 'created';

export type Status = 'complete' | 'in_progress' | 'abandoned';

export const DROP_OFF_MS = 24 * 60 * 60 * 1000;

export function statusOf(l: AdminLead, now = Date.now()): Status {
  if (l.progress >= 100 || l.last_step === 'submitted') return 'complete';
  if (now - l.updated_at > DROP_OFF_MS) return 'abandoned';
  return 'in_progress';
}

export function packageLabel(p?: AdminLead['package']): string {
  if (p === 'basic') return 'Basic · $50';
  if (p === 'monthly') return 'Monthly · $50+$5/mo';
  if (p === 'unlimited') return 'Unlimited · $50+$10/mo';
  return '—';
}

export function packageRevenue(p?: AdminLead['package']): number {
  if (p === 'basic') return 50;
  if (p === 'monthly') return 50 + 5 * 12;
  if (p === 'unlimited') return 50 + 10 * 12;
  return 0;
}

export function relativeTime(ts: number, now = Date.now()): string {
  const d = Math.max(0, now - ts);
  const s = Math.floor(d / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const dd = Math.floor(h / 24);
  return `${dd}d ago`;
}
