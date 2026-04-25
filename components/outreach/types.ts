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

export type EnrollmentStatus = 'active' | 'paused' | 'completed' | 'stopped' | 'bounced' | 'unsubscribed';

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

export type ActivityEvent = {
  id: string;
  contact_id: string | null;
  enrollment_id: string | null;
  sequence_id: string | null;
  step_idx: number | null;
  type: string;
  meta: Record<string, unknown>;
  ts: number;
};

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

export type Template = {
  id: string;
  name: string;
  subject: string;
  body: string;
  created_at: number;
  updated_at: number;
};

export function fullName(c: Pick<Contact, 'first_name' | 'last_name'>): string {
  return [c.first_name, c.last_name].filter(Boolean).join(' ').trim();
}

export function pct(n: number): string {
  if (!isFinite(n) || isNaN(n)) return '0%';
  return `${Math.round(n * 1000) / 10}%`;
}

export function relTime(ts: number, now = Date.now()): string {
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
