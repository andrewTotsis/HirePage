'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type Stats = {
  ai_configured: boolean;
  google_oauth_configured: boolean;
  gmail_connected: boolean;
  gmail_email: string | null;
};

export default function SettingsView() {
  const sp = useSearchParams();
  const gmailFlash = sp?.get('gmail');
  const gmailError = sp?.get('gmail_error');
  const [stats, setStats] = useState<Stats | null>(null);

  const reload = async () => {
    const r = await fetch('/api/admin/outreach/stats', { cache: 'no-store' });
    setStats(await r.json());
  };
  useEffect(() => { reload(); }, []);

  const disconnect = async () => {
    if (!confirm('Disconnect Gmail? You won\'t be able to send outreach until reconnected.')) return;
    await fetch('/api/admin/google/disconnect', { method: 'POST' });
    await reload();
  };

  return (
    <main className="mx-auto max-w-[800px] px-6 pb-24 pt-6">
      <Link href="/admin/outreach" className="text-xs text-white/45 hover:text-white/70">← Outreach</Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Outreach settings</h1>
      <p className="mt-1 text-sm text-white/55">Connect Gmail to send. Check service status.</p>

      {gmailFlash === 'connected' && (
        <div className="mt-5 rounded-xl border border-[#22c55e]/25 bg-[#22c55e]/10 px-4 py-2.5 text-sm text-[#86efac]">
          Gmail connected — you can now send outreach.
        </div>
      )}
      {gmailError && (
        <div className="mt-5 rounded-xl border border-[#ef4444]/25 bg-[#ef4444]/10 px-4 py-2.5 text-sm text-[#fca5a5]">
          Gmail OAuth failed: <span className="font-mono">{gmailError}</span>
        </div>
      )}

      <div className="mt-8 space-y-6">
        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Gmail · sending</div>
              <p className="mt-1 max-w-xl text-sm text-white/55">
                Connect your Gmail (e.g. <span className="font-mono text-white/75">andrew@hirepage.app</span>). Outreach sends through the Gmail API — emails appear in your Sent folder, replies land in your inbox naturally.
              </p>
              <p className="mt-2 text-xs text-white/45">
                OAuth scope: <code className="font-mono">gmail.send</code>. We can&rsquo;t read your inbox.
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
              <span className="text-[#fbbf24]/85">
                Set <code className="font-mono">GOOGLE_CLIENT_ID</code> and <code className="font-mono">GOOGLE_CLIENT_SECRET</code> in Vercel.
                In Google Cloud Console: enable Gmail API, OAuth consent screen with test user andrew@hirepage.app, Web Application credentials, redirect URI <code className="font-mono">https://hirepage.app/api/admin/google/callback</code>, scope <code className="font-mono">gmail.send</code>.
              </span>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {stats?.gmail_connected ? (
              <button onClick={disconnect} className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/65 hover:border-[#ef4444]/40 hover:text-[#fca5a5]">
                Disconnect
              </button>
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

        <section className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
          <div className="text-sm font-semibold">Services</div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Service name="Gmail (sending)" ok={!!stats?.gmail_connected} hint={stats?.gmail_email ?? 'Click Connect Gmail above'} />
            <Service name="Google OAuth" ok={!!stats?.google_oauth_configured} hint={stats?.google_oauth_configured ? 'Configured' : 'Set GOOGLE_CLIENT_ID / SECRET'} />
            <Service name="Anthropic (AI intros)" ok={!!stats?.ai_configured} hint={stats?.ai_configured ? 'Claude Haiku 4.5' : 'Set ANTHROPIC_API_KEY (optional)'} />
          </div>
        </section>
      </div>
    </main>
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
