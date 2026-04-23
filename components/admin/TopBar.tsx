'use client';

type Props = {
  query: string;
  onQuery: (v: string) => void;
};

export default function TopBar({ query, onQuery }: Props) {
  const logout = async () => {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    window.location.href = '/admin/login';
  };

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1500px] items-center gap-4 px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[11px] font-bold tracking-tight text-black">
            HP
          </div>
          <div className="text-sm font-semibold">HirePage CRM</div>
          <div className="ml-2 rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white/70">
            Internal
          </div>
        </div>

        <div className="relative flex-1">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3-3" />
          </svg>
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Search by name, email, or role…"
            className="w-full rounded-xl border border-white/10 bg-white/5 px-9 py-2 text-sm text-white outline-none transition-all placeholder:text-white/35 focus:border-white/25 focus:bg-white/10"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] text-white/40 sm:block">
            /
          </kbd>
        </div>

        <button
          onClick={logout}
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-all hover:border-white/25 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
