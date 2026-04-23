'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get('from') || '/admin';
  const [pw, setPw] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: pw }),
      });
      if (!r.ok) {
        setErr('Incorrect password');
        setBusy(false);
        return;
      }
      router.replace(from.startsWith('/admin') ? from : '/admin');
      router.refresh();
    } catch {
      setErr('Something went wrong');
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-[#6366f1]/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[320px] w-[520px] rounded-full bg-[#22d3ee]/10 blur-3xl" />
      </div>
      <motion.form
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        onSubmit={submit}
        className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)]"
      >
        <div className="mb-6 flex items-center gap-2 text-sm font-medium text-white/70">
          <span className="inline-block h-2 w-2 rounded-full bg-[#22c55e]" />
          HirePage CRM
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-1 text-sm text-white/50">Internal access only.</p>
        <label className="mt-6 block text-xs font-medium uppercase tracking-[0.14em] text-white/40">
          Password
        </label>
        <input
          autoFocus
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none transition-all placeholder:text-white/30 focus:border-white/30 focus:ring-4 focus:ring-white/5"
          placeholder="••••••••"
        />
        {err && <div className="mt-3 text-sm text-[#f87171]">{err}</div>}
        <button
          type="submit"
          disabled={busy || !pw}
          className="mt-6 w-full rounded-xl bg-white py-3 font-semibold text-black transition-all hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy ? 'Signing in…' : 'Continue'}
        </button>
      </motion.form>
    </div>
  );
}
