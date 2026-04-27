export type FunnelStatus =
  | 'lead'
  | 'in_progress'
  | 'complete'
  | 'paid'
  | 'delivered'
  | 'abandoned';

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
  paid: boolean;
  paid_at: number | null;
  delivered: boolean;
  delivered_at: number | null;
  status_override: FunnelStatus | null;
  showcase: boolean | null;
  created_at: number;
  updated_at: number;
};

export type Segment =
  | 'all'
  | 'lead'
  | 'in_progress'
  | 'complete'
  | 'paid'
  | 'delivered'
  | 'abandoned';

export type SortBy = 'recent' | 'intent' | 'created';

export const DROP_OFF_MS = 24 * 60 * 60 * 1000;

export function statusOf(l: AdminLead, now = Date.now()): FunnelStatus {
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

export const STATUS_STYLES: Record<FunnelStatus, { ring: string; bg: string; text: string; dot: string }> = {
  lead: {
    ring: 'ring-white/15',
    bg: 'bg-white/5',
    text: 'text-white/75',
    dot: 'bg-white/55',
  },
  in_progress: {
    ring: 'ring-[#f59e0b]/25',
    bg: 'bg-[#f59e0b]/15',
    text: 'text-[#fbbf24]',
    dot: 'bg-[#f59e0b]',
  },
  complete: {
    ring: 'ring-[#6366f1]/25',
    bg: 'bg-[#6366f1]/15',
    text: 'text-[#a5b4fc]',
    dot: 'bg-[#6366f1]',
  },
  paid: {
    ring: 'ring-[#22c55e]/25',
    bg: 'bg-[#22c55e]/15',
    text: 'text-[#4ade80]',
    dot: 'bg-[#22c55e]',
  },
  delivered: {
    ring: 'ring-[#0ea5e9]/30',
    bg: 'bg-[#0ea5e9]/15',
    text: 'text-[#7dd3fc]',
    dot: 'bg-[#0ea5e9]',
  },
  abandoned: {
    ring: 'ring-[#ef4444]/25',
    bg: 'bg-[#ef4444]/15',
    text: 'text-[#f87171]',
    dot: 'bg-[#ef4444]',
  },
};

export const STATUS_ORDER: FunnelStatus[] = [
  'lead',
  'in_progress',
  'complete',
  'paid',
  'delivered',
  'abandoned',
];

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
