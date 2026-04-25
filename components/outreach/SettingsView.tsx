'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Stats = {
  email_configured: boolean;
  from: string;
  ai_configured: boolean;
  google_oauth_configured: boolean;
  gmail_connected: boolean;
  gmail_email: string | null;
  warmup: { enabled: boolean; day: number | null; cap: number | null; sent_today: number; remaining_today: number | null };
};

type WarmupConfig = {
  enabled: boolean;
  start_date_ms: number;
  day_one_cap: number;
  daily_increment: number;
  daily_max: number;
};

export default function SettingsView() {
  const sp = useSearchParams();
  const gmailFlash = sp?.get('gmail');
  const gmailError = sp?.get('gmail_error');

  const [stats, setStats] = useState<Stats | null>(null);
  const [warmup, setWarmup] = useState<WarmupConfig | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const reload = async () => {
    const [r1, r2] = await Promise.all([
      fetch('/api/admin/outreach/stats', { cache: 'no-store' }),
      fetch('/api/admin/outreach/warmup', { cache: 'no-store' }),
    ]);
    setStats(await r1.json());
    const j2 = await r2.json();
    setWarmup(j2.config);
  };
  useEffect(() => { reload(); }, []);

  const saveWarmup = async (patch: Partial<WarmupConfig>) => {
    const r = await fetch('/api/admin/outreach/warmup', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const j = await r.json();
    setWarmup(j.config);
    await reload();
  };

  const disconnectGmail = async () => {
    if (!confirm('Disconnect Gmail? Reply detection will stop until reconnected.')) return;
    await fetch('/api/admin/google/disconnect', { method: 'POST' });
    await reload();
  };

  const scanReplies = async () => {
    setScanning(true);
    setScanResult(null);
    try {
      const r = await fetch('/api/admin/google/scan', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ lookback_hours: 48 }),
      });
      const j = await r.json();
      if (r.ok) {
        setScanResult(`Scanned ${j.scanned} · matched ${j.matched} repl${j.matched === 1 ? 'y' : 'ies'}`);
      } else {
        setScanResult(j.error || 'Failed');
      }
    } catch (e) {
      setScanResult(e instanceof Error ? e.message : 'Failed');
    } finally {
      setScanning(false);
    }
  };

  return (
    <main className="mx-auto max-w-[900px] px-6 pb-24 pt-6">
      <Link href="/admin/outreach" className="text-xs text-white/45 hover:text-white/70">← Outreach</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Outreach settings</h1>
      <p className="mt-1 text-sm text-white/55">Connect Gmail for reply detection, configure warm-up, see service status.</p>

      {gmailFlash === 'connected' && (
        <div className="mt-5 rounded-xl border border-[#22c55e]/25 bg-[#22c55e]/10 px-4 py-2.5 text-sm text-[#86efac]">
          Gmail connected. Replies will be auto-detected.
        </div>
      )}
      {gmailError && (
        <div className="mt-5 rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/10 px-4 py-2.5 text-sm text-[#fca5a5]">
          Gmail OAuth failed: <span className="font-mono">{gmailError}</span>
        </div>
      )}

      <div className="mt-8 space-y-6">
        {/* Gmail */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Gmail · reply detection</div>
              <p className="mt-1 max-w-xl text-sm text-white/55">
                Connect your Gmail (e.g. <span className="font-mono text-white/75">andrew@hirepage.app</span>) so HirePage can watch for replies and automatically pause sequences when contacts respond. We poll every 10 minutes.
              </p>
            </div>
            {stats?.gmail_connected ? (
              <div className="text-right">
                <div className="rounded-full bg-[#22c55e]/15 px-3 py-1 text-[11px] text-[#86efac]">Connected</div>
                <div className="mt-1 text-xs text-white/55">{stats.gmail_email}</div>
              </div>
            ) : (
              <div className="rounded-full bg-white/5 px-3 py-1 text-[11px] text-white/65">Not connected</div>
            )}
          </div>

          {!stats?.google_oauth_configured && (
            <div className="mt-4 rounded-xl border border-[#f59e0b]/25 bg-[#f59e0b]/[0.08] px-3 py-2 text-xs text-[#fbbf24]">
              <span className="font-medium">Setup needed.</span>{' '}
              <span className="text-[#fbbf24]/85">Set <code className="font-mono">GOOGLE_CLIENT_ID</code> and <code className="font-mono">GOOGLE_CLIENT_SECRET</code> in Vercel. Use OAuth Web Application credentials with redirect URI <code className="font-mono">https://hirepage.app/api/admin/google/callback</code> and scope <code className="font-mono">gmail.readonly</code>.</span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {stats?.gmail_connected ? (
              <>
                <button
                  onClick={scanReplies}
                  disabled={scanning}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10 disabled:opacity-50"
                >
                  {scanning ? 'Scanning…' : 'Scan inbox now'}
                </button>
                <button
                  onClick={disconnectGmail}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/65 hover:border-[#ef4444]/40 hover:text-[#fca5a5]"
                >
                  Disconnect
                </button>
                {scanResult && <span className="self-center text-xs text-white/65">{scanResult}</span>}
              </>
            ) : (
              <a
                href="/api/admin/google/connect"
                className={`rounded-lg px-3 py-1.5 text-sm font-medium ${stats?.google_oauth_configured ? 'bg-white text-black hover:bg-white/90' : 'cursor-not-allowed bg-white/10 text-white/40'}`}
              >
                Connect Gmail
              </a>
            )}
          </div>
        </section>

        {/* Warm-up */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Sender warm-up</div>
              <p className="mt-1 max-w-xl text-sm text-white/55">
                Gradually ramp daily volume on a new domain to protect deliverability. Recommended for the first 14 days after verifying a new sending domain.
              </p>
            </div>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={!!warmup?.enabled}
                onChange={(e) => saveWarmup({ enabled: e.target.checked })}
              />
              <span className="text-sm">Enabled</span>
            </label>
          </div>

          {warmup?.enabled && stats && (
            <div className="mt-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm">
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                <KV k="Day" v={stats.warmup.day != null ? String(stats.warmup.day) : '—'} />
                <KV k="Today's cap" v={stats.warmup.cap != null ? String(stats.warmup.cap) : '∞'} />
                <KV k="Sent today" v={String(stats.warmup.sent_today)} />
                <KV k="Remaining" v={stats.warmup.remaining_today != null ? String(stats.warmup.remaining_today) : '∞'} />
              </div>
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <NumField label="Day one cap" value={warmup?.day_one_cap ?? 5} onChange={(v) => saveWarmup({ day_one_cap: v })} />
            <NumField label="Daily increment" value={warmup?.daily_increment ?? 5} onChange={(v) => saveWarmup({ daily_increment: v })} />
            <NumField label="Daily max" value={warmup?.daily_max ?? 50} onChange={(v) => saveWarmup({ daily_max: v })} />
          </div>
          <div className="mt-3 text-xs text-white/45">
            Curve: day 1 sends up to {warmup?.day_one_cap ?? 5}, ramps {warmup?.daily_increment ?? 5}/day, capped at {warmup?.daily_max ?? 50}.
          </div>
        </section>

        {/* Service status */}
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="text-sm font-semibold">Services</div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Service name="Resend (sending)" ok={!!stats?.email_configured} hint={stats?.email_configured ? `From: ${stats?.from}` : 'Set RESEND_API_KEY'} />
            <Service name="Anthropic (AI intros)" ok={!!stats?.ai_configured} hint={stats?.ai_configured ? 'Claude Haiku 4.5' : 'Set ANTHROPIC_API_KEY'} />
            <Service name="Google OAuth" ok={!!stats?.google_oauth_configured} hint={stats?.google_oauth_configured ? 'Configured' : 'Set GOOGLE_CLIENT_ID / SECRET'} />
            <Service name="Gmail connected" ok={!!stats?.gmail_connected} hint={stats?.gmail_email ?? 'Click Connect Gmail above'} />
          </div>
        </section>
      </div>
    </main>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <span className="text-white/40">{k}: </span>
      <span className="font-medium text-white/85 tabular-nums">{v}</span>
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  useEffect(() => { setDraft(String(value)); }, [value]);
  return (
    <label className="block">
      <div className="mb-1 text-[11px] font-medium uppercase tracking-[0.14em] text-white/45">{label}</div>
      <input
        type="number"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          const n = Math.max(0, Math.floor(Number(draft) || 0));
          if (n !== value) onChange(n);
          setDraft(String(n));
        }}
        className="w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm tabular-nums outline-none focus:border-white/25"
      />
    </label>
  );
}

function Service({ name, ok, hint }: { name: string; ok: boolean; hint?: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5 text-sm">
      <div>
        <div className="font-medium">{name}</div>
        {hint && <div className="text-xs text-white/55">{hint}</div>}
      </div>
      <span className={`rounded-full px-2 py-0.5 text-[10px] ${ok ? 'bg-[#22c55e]/15 text-[#86efac]' : 'bg-white/8 text-white/50'}`}>
        {ok ? 'Ready' : 'Not set'}
      </span>
    </div>
  );
}
