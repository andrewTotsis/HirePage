import { outreachStorage } from './outreach-storage';

export type WarmupConfig = {
  enabled: boolean;
  start_date_ms: number;
  day_one_cap: number;
  daily_increment: number;
  daily_max: number;
};

export const DEFAULT_WARMUP: WarmupConfig = {
  enabled: false, // off by default; user opts in
  start_date_ms: 0,
  day_one_cap: 5,
  daily_increment: 5,
  daily_max: 50,
};

export async function getWarmup(): Promise<WarmupConfig> {
  const v = await outreachStorage.getSetting<Partial<WarmupConfig>>('warmup');
  return { ...DEFAULT_WARMUP, ...(v ?? {}) };
}

export async function putWarmup(patch: Partial<WarmupConfig>): Promise<WarmupConfig> {
  const cur = await getWarmup();
  const next: WarmupConfig = { ...cur, ...patch };
  if (patch.enabled && !cur.enabled) {
    next.start_date_ms = patch.start_date_ms ?? Date.now();
  }
  await outreachStorage.putSetting('warmup', next as unknown as Record<string, unknown>);
  return next;
}

const DAY_MS = 24 * 60 * 60 * 1000;

export function dayNumber(cfg: WarmupConfig, now = Date.now()): number {
  if (!cfg.enabled || !cfg.start_date_ms) return Infinity;
  return Math.floor((now - cfg.start_date_ms) / DAY_MS) + 1;
}

export function todaysCap(cfg: WarmupConfig, now = Date.now()): number {
  if (!cfg.enabled) return Infinity;
  const d = dayNumber(cfg, now);
  if (d <= 0) return 0;
  const cap = cfg.day_one_cap + (d - 1) * cfg.daily_increment;
  return Math.min(cap, cfg.daily_max);
}

export function startOfTodayMs(now = Date.now()): number {
  const d = new Date(now);
  d.setUTCHours(0, 0, 0, 0);
  return d.getTime();
}

export type WarmupStatus = {
  enabled: boolean;
  day: number | null;
  cap: number; // Infinity when disabled
  sent_today: number;
  remaining_today: number;
};

export async function warmupStatus(now = Date.now()): Promise<WarmupStatus> {
  const cfg = await getWarmup();
  const sent = await outreachStorage.countSentSince(startOfTodayMs(now));
  if (!cfg.enabled) {
    return { enabled: false, day: null, cap: Infinity, sent_today: sent, remaining_today: Infinity };
  }
  const cap = todaysCap(cfg, now);
  const day = dayNumber(cfg, now);
  return {
    enabled: true,
    day: Number.isFinite(day) ? day : null,
    cap,
    sent_today: sent,
    remaining_today: Math.max(0, cap - sent),
  };
}
