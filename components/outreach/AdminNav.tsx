'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Tab = { href: string; label: string; match: (p: string) => boolean };

const TABS: Tab[] = [
  { href: '/admin', label: 'Leads', match: (p) => p === '/admin' || p.startsWith('/admin/leads') },
  { href: '/admin/outreach', label: 'Outreach', match: (p) => p.startsWith('/admin/outreach') },
  { href: '/admin/payments', label: 'Payments', match: (p) => p.startsWith('/admin/payments') },
];

export default function AdminNav() {
  const pathname = usePathname() || '';
  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#09090b]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-6 px-6">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] font-bold tracking-tight text-black">
            HP
          </div>
          <div className="text-sm font-semibold">HirePage CRM</div>
        </Link>

        <nav className="flex items-center gap-1">
          {TABS.map((t) => {
            const active = t.match(pathname);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-white/10 text-white'
                    : 'text-white/55 hover:bg-white/5 hover:text-white'
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto">
          <button
            onClick={logout}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/25 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
